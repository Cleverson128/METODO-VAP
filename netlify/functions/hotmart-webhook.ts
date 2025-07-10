import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);
const resend = new Resend(resendApiKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 🔒 Verificação de segurança
    const hottok = event.headers['x-hotmart-hottok'];
    if (hottok !== webhookSecret) {
      console.error("Falha na verificação de segurança. Hottok não corresponde.");
      return { statusCode: 401, body: 'Unauthorized webhook' };
    }

    const payload = JSON.parse(event.body || '{}');

    // ✅ Extração correta do e-mail
    const email = payload?.data?.buyer?.email;
    if (!email) {
      console.error("Email do comprador não encontrado no payload. Payload recebido:", JSON.stringify(payload, null, 2));
      return { statusCode: 400, body: 'Email do comprador não encontrado no payload.' };
    }

    const password = generateSecurePassword(email);

    // ✅ Tentar criar o usuário
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    // ⚠️ Se o usuário já existir, seguimos com o envio do e-mail normalmente
    if (error && !error.message.includes('User already registered')) {
      console.error("Erro ao criar usuário no Supabase:", error.message);
      return { statusCode: 500, body: 'Erro ao criar usuário' };
    }

    // ✅ Enviar o e-mail de boas-vindas
    await resend.emails.send({
      from: 'Método VAP <contato@email.fipei.com.br>',
      to: email,
      subject: 'Seus dados de acesso ao Método VAP',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🎉 Bem-vindo ao Método VAP!</h2>
          <p>Seu acesso já está liberado:</p>
          <p><strong>Login:</strong> ${email}<br>
          <strong>Senha:</strong> ${password}</p>
          <p>🔗 Portal: <a href="https://portalcursovap.fipei.com.br">Acessar o Portal</a></p>
          <p>📄 PDF: <a href="https://portalcursovap.fipei.com.br/o-metodo-vap.pdf">Baixar o Material do Curso</a></p>
          <p>Recomendamos trocar a senha após o primeiro login.</p>
          <br>
          <p>💚 Bons estudos!</p>
        </div>
      `
    });

    console.log(`Usuário processado com sucesso e e-mail enviado para ${email}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, email })
    };

  } catch (err) {
    const error = err as Error;
    console.error('Erro geral no webhook:', error.message);
    return { statusCode: 500, body: 'Erro interno do servidor' };
  }
};

function generateSecurePassword(email: string): string {
  const nome = email.split('@')[0];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}${Date.now().toString().slice(-4)}!`;
}
