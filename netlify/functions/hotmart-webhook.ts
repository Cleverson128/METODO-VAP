import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET!;
const resendApiKey = process.env.RESEND_API_KEY!;

// Instâncias
const supabase = createClient(supabaseUrl, serviceRole);
const resend = new Resend(resendApiKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { email } = data;

    if (!email) {
      return { statusCode: 400, body: 'Email ausente no payload' };
    }

    // Validação da assinatura (Hotmart)
    const signature = event.headers['x-hotmart-signature'];
    if (!signature || signature !== webhookSecret) {
      return { statusCode: 401, body: 'Webhook não autorizado (assinatura inválida)' };
    }

    // Gerar senha segura
    const password = generateSecurePassword(email);

    // Criar usuário
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error && !error.message.includes('User already registered')) {
      console.error('Erro ao criar usuário:', error);
      return { statusCode: 500, body: 'Erro ao criar usuário no Supabase' };
    }

    // Enviar e-mail com acesso
    await resend.emails.send({
      from: 'Método VAP <contato@fipei.com.br>',
      to: email,
      subject: 'Seus dados de acesso ao Método VAP',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🎉 Bem-vindo ao Método VAP!</h2>
          <p>Seu acesso já está liberado.</p>
          <p><strong>Login:</strong> ${email}<br>
          <strong>Senha:</strong> ${password}</p>
          <p>Portal de acesso: <a href="https://portalcursovap.fipei.com.br">https://portalcursovap.fipei.com.br</a></p>
          <p>Recomendamos trocar a senha após o primeiro login.</p>
          <br>
          <p>💚 Bons estudos!</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, email })
    };

  } catch (err) {
    console.error('Erro geral no webhook:', err);
    return { statusCode: 500, body: 'Erro ao processar webhook' };
  }
};

function generateSecurePassword(email: string): string {
  const nome = email.split('@')[0];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}${Date.now().toString().slice(-4)}!`;
}
