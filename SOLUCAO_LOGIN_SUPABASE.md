# 🔧 Solução para Erro de Login por Email no Supabase

## ❌ Problema Identificado
O erro `Email logins are disabled` (código 422) ocorre porque:
- O Supabase requer confirmação de email por padrão
- Sem um servidor SMTP customizado, apenas emails de membros da equipe podem fazer login
- O email `cliente@admin.com` não está na lista de membros da equipe

## ✅ Solução: Desabilitar Confirmação de Email

### Passo 1: Obter Token de Acesso
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Dê um nome para o token (ex: "Config Auth")
4. Copie o token gerado

### Passo 2: Configurar o Script
1. Abra o arquivo `configure-supabase.js`
2. Substitua `SEU_TOKEN_AQUI` pelo token copiado
3. Salve o arquivo

### Passo 3: Executar a Configuração
```bash
node configure-supabase.js
```

### Passo 4: Testar o Login
```bash
node test-login.js
```

## 🔍 O que a Configuração Faz
- **`mailer_autoconfirm: true`**: Confirma emails automaticamente
- **`enable_signup: true`**: Permite registro de novos usuários
- **`disable_signup: false`**: Garante que o signup não está desabilitado

## 🚀 Resultado Esperado
Após a configuração, o login com `cliente@admin.com` deve funcionar sem necessidade de confirmação de email.

## 📋 Informações do Projeto
- **Project ID**: `bhhifpcihjpjfmhgxlmz`
- **Organização**: M1GU5T4's Org
- **Região**: sa-east-1

## 🔄 Alternativas (se necessário)
1. **Configurar SMTP Customizado**: Para produção, configure um servidor SMTP
2. **Adicionar Email à Equipe**: Adicione o email como membro da organização
3. **Usar Magic Link**: Configure autenticação por link mágico

## 📞 Suporte
Se o problema persistir, verifique:
- Token de acesso válido
- Permissões da organização
- Logs do Supabase no dashboard