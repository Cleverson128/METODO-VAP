// netlify/functions/hotmart-webhook.ts
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
    const { email, hotmart_key } = data;

    // Verificar segredo (proteção)
    if (event.headers['x-hotmart-signature'] !== webhookSecret) {
      return { statusCode: 401, body: 'Unauthorized webhook' };
    }

    if (!email) {
      return { statusCode: 400, body: 'Email ausente no payload' };
    }

    // Tentar criar o usuário no Supabase
    const { error } = await supabase.auth.admin.createUser({
      email,
      password: generateSecurePassword(email),
      email_confirm: true
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { statusCode: 200, body: 'Usuário já existe' };
      }
      console.error('Erro ao criar usuário:', error);
      return { statusCode: 500, body: 'Erro interno ao criar usuário' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, email })
    };
  } catch (err) {
    console.error('Erro no webhook:', err);
    return { statusCode: 500, body: 'Erro ao processar webhook' };
  }
};

function generateSecurePassword(email: string) {
  const base = email.split('@')[0];
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${Date.now().toString().slice(-4)}!`;
}
