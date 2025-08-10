// Script para configurar um usuário como administrador
// Este script define o user_metadata.user_type como 'dono' para um usuário específico

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (usando service role key para operações administrativas)
// Para desenvolvimento local, usando as credenciais padrão do Supabase local
const supabaseUrl = 'http://localhost:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser(email) {
  try {
    console.log(`Configurando usuário ${email} como administrador...`);
    
    // Buscar o usuário pelo email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('Erro ao buscar usuários:', fetchError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`Usuário com email ${email} não encontrado.`);
      console.log('Usuários disponíveis:');
      users.users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
      return;
    }
    
    console.log(`Usuário encontrado: ${user.email} (ID: ${user.id})`);
    
    // Atualizar o user_metadata para definir como admin
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          user_type: 'dono'
        }
      }
    );
    
    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return;
    }
    
    console.log('✅ Usuário configurado como administrador com sucesso!');
    console.log('User metadata:', updatedUser.user.user_metadata);
    
    // Verificar se o usuário já está na tabela admin_users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);
    
    if (adminError) {
      console.error('Erro ao verificar tabela admin_users:', adminError);
    } else if (adminUsers.length === 0) {
      // Adicionar à tabela admin_users
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ user_id: user.id });
      
      if (insertError) {
        console.error('Erro ao adicionar à tabela admin_users:', insertError);
      } else {
        console.log('✅ Usuário adicionado à tabela admin_users!');
      }
    } else {
      console.log('ℹ️ Usuário já existe na tabela admin_users.');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Função para listar todos os usuários
async function listUsers() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Erro ao listar usuários:', error);
      return;
    }
    
    console.log('Usuários cadastrados:');
    users.users.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  User Type: ${user.user_metadata?.user_type || 'não definido'}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

if (command === 'list') {
  listUsers();
} else if (command === 'setup' && email) {
  setupAdminUser(email);
} else {
  console.log('Uso:');
  console.log('  node setup-admin-user.js list                    # Listar todos os usuários');
  console.log('  node setup-admin-user.js setup <email>          # Configurar usuário como admin');
  console.log('');
  console.log('Exemplos:');
  console.log('  node setup-admin-user.js list');
  console.log('  node setup-admin-user.js setup admin@example.com');
}