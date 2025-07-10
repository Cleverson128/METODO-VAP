import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET!;

const supabase = createClient(supabaseUrl, serviceKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // --- LINHAS DE DEBUG ADICIONADAS ---
    console.log("--- DEBUG HOTMART WEBHOOK ---");
    console.log("Header 'hottok' recebido:", event.headers['hottok']);
    console.log("Secret esperado (início):", webhookSecret ? webhookSecret.substring(0, 5) + '...' : 'SECRET NÃO DEFINIDO');
    console.log("A comparação de segurança resulta em falha:", event.headers['hottok'] !== webhookSecret);
    // --- FIM DAS LINHAS DE DEBUG ---

    // Verificação de segurança CORRIGIDA
    if (event.headers['hottok'] !== webhookSecret) {
      return { statusCode: 401, body: 'Unauthorized webhook' };
    }

    const { email } = data;
    if (!email) return { statusCode: 400, body: 'Email ausente' };

    const { error } = await supabase.auth.admin.createUser({
      email,
      password: generateSecurePassword(email),
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { statusCode: 200, body: 'Usuário já existe' };
      }
      return { statusCode: 500, body: 'Erro ao criar usuário' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    const error = err as Error;
    console.error('Erro no webhook:', error.message);
    return { statusCode: 500, body: 'Erro interno do servidor' };
  }
};

function generateSecurePassword(email: string): string {
  const base = email.split('@')[0];
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${Date.now().toString().slice(-4)}!`;
}