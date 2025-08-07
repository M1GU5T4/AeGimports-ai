import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://bhhifpcihjpjfmhgxlmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaGlmcGNpaGpwamZtaGd4bG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTYzOTUsImV4cCI6MjA2OTMzMjM5NX0.rWS9Wpm7iorsSH1uOcPX0GABFSxJnj_mQGCMcdU_hZo';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar login
async function testLogin() {
  try {
    console.log('🔍 Testando login com cliente@admin.com...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'cliente@admin.com',
      password: '123456789'
    });

    if (error) {
      console.error('❌ Erro de login:', {
        message: error.message,
        status: error.status,
        code: error.code || 'N/A'
      });
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Dados do usuário:', {
      id: data.user?.id,
      email: data.user?.email,
      confirmed_at: data.user?.email_confirmed_at
    });
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar teste
testLogin();