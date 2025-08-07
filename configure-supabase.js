// Script para configurar o Supabase e desabilitar confirmação de email
// Você precisa obter um token de acesso em: https://supabase.com/dashboard/account/tokens

const PROJECT_REF = 'bhhifpcihjpjfmhgxlmz';
const SUPABASE_ACCESS_TOKEN = 'SEU_TOKEN_AQUI'; // Substitua pelo seu token

async function configureSupabase() {
  try {
    console.log('Configurando Supabase para desabilitar confirmação de email...');
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Desabilita a confirmação de email
        mailer_autoconfirm: true,
        // Habilita signup por email
        enable_signup: true,
        // Permite login sem confirmação
        disable_signup: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Configuração aplicada com sucesso!');
    console.log('Resultado:', result);
    
    console.log('\n🔄 Agora teste o login novamente.');
    
  } catch (error) {
    console.error('❌ Erro ao configurar Supabase:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Dica: Verifique se o token de acesso está correto.');
      console.log('Obtenha um novo token em: https://supabase.com/dashboard/account/tokens');
    }
  }
}

// Verificar se o token foi fornecido
if (SUPABASE_ACCESS_TOKEN === 'SEU_TOKEN_AQUI') {
  console.log('❌ Por favor, substitua SEU_TOKEN_AQUI pelo seu token de acesso do Supabase.');
  console.log('Obtenha o token em: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

configureSupabase();