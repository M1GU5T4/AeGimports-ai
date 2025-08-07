// Script para configurar as definições de autenticação do Supabase
// Habilita inscrição por e-mail e desabilita confirmação automática

const PROJECT_REF = 'bhhifpcihjpjfmhgxlmz';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Token de acesso do Supabase não encontrado!');
  console.log('💡 Obtenha seu token em: https://supabase.com/dashboard/account/tokens');
  console.log('💡 Execute: set SUPABASE_ACCESS_TOKEN=sbp_6c1a6b5ebc1c7c63a8c49637cad3313f1b7ab580');
  process.exit(1);
}

async function configureAuthSettings() {
  try {
    console.log('🔧 Configurando definições de autenticação...');
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_email_enabled: true,
        mailer_autoconfirm: true,
        disable_signup: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Configurações de autenticação atualizadas com sucesso!');
    console.log('📧 Inscrição por e-mail: HABILITADA');
    console.log('🔓 Confirmação automática de e-mail: HABILITADA');
    console.log('👥 Inscrição de novos usuários: HABILITADA');
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao configurar autenticação:', error.message);
    throw error;
  }
}

// Executar a configuração
configureAuthSettings()
  .then(() => {
    console.log('\n🎉 Configuração concluída! Agora você pode testar o login.');
  })
  .catch((error) => {
    console.error('\n💥 Falha na configuração:', error.message);
    process.exit(1);
  });