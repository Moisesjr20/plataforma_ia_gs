# Deploy no EasyPanel - Guia Completo

## 🚨 Problema Identificado e Solução

### O Problema
A aplicação não estava funcionando no EasyPanel porque as **variáveis de ambiente não estavam sendo injetadas durante o build**. Em aplicações Vite/React, as variáveis `VITE_*` precisam estar disponíveis no momento do build para serem incluídas no bundle final.

### A Solução
Modificamos o `Dockerfile` para aceitar as variáveis de ambiente como **build arguments** e as exportar durante o processo de build.

## 📋 Configuração no EasyPanel

### 1. Variáveis de Ambiente (Build Args)
Configure estas variáveis na seção **Environment Variables** do EasyPanel:

```bash
# Configurações do Supabase (OBRIGATÓRIAS)
VITE_SUPABASE_URL=https://eevnlsmjapojsqebyexc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldm5sc21qYXBvanNxZWJ5ZXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjY4MDksImV4cCI6MjA2NzQwMjgwOX0.9lVwbskR1e7d83E6ScqGfVaXC1PfbiNz18jzCDhXX5I

# Configurações dos Webhooks (OPCIONAIS)
VITE_WEBHOOK_AUGUSTO=https://webhook.dev.kyrius.com.br/webhook/augusto
VITE_WEBHOOK_SOFIA=https://webhook.dev.kyrius.com.br/webhook/sofia
VITE_WEBHOOK_CAROL=https://webhook.dev.kyrius.com.br/webhook/carol

# Configuração de Ambiente
NODE_ENV=production
```

### 2. Configuração de Domínio
- **Host**: `projetos-avulsos-sistema-gs.whhc5g`
- **Protocolo**: HTTP
- **Porta**: 5173
- **Caminho**: `/`

### 3. Health Check
A aplicação possui um endpoint de health check em `/health` que retorna `200 OK`.

## 🔧 Alterações Realizadas

### 1. Dockerfile
- Adicionados `ARG` para receber variáveis de ambiente durante o build
- Exportadas as variáveis como `ENV` antes do `npm run build`
- Garantido que as variáveis estejam disponíveis durante a compilação

### 2. agents.ts
- Corrigidos os nomes das variáveis de ambiente dos webhooks
- Todos os agentes agora usam variáveis de ambiente com fallback

## 🚀 Processo de Deploy

1. **Commit e Push** das alterações para o repositório
2. **Configurar as variáveis de ambiente** no EasyPanel
3. **Fazer o redeploy** da aplicação
4. **Aguardar o build** (pode levar alguns minutos)
5. **Testar a aplicação** na URL fornecida

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

1. **URL da aplicação**: https://projetos-avulsos-sistema-gs.whhc5g.easypanel.host/
2. **Health check**: https://projetos-avulsos-sistema-gs.whhc5g.easypanel.host/health
3. **Login/Registro**: Teste com credenciais do Supabase
4. **Funcionalidade dos agentes**: Verifique se os webhooks estão funcionando

## 🔍 Troubleshooting

### Se a aplicação ainda não funcionar:

1. **Verifique os logs** do container no EasyPanel
2. **Confirme as variáveis de ambiente** estão configuradas corretamente
3. **Teste o health check** endpoint
4. **Verifique se o build foi bem-sucedido**

### Logs Esperados:
```
Starting Nginx...
nginx: configuration file /etc/nginx/nginx.conf test is successful
Nginx configuration test successful
Waiting for EasyPanel health check initialization...
```

## 📞 Suporte

Se ainda houver problemas:
1. Verifique os logs do container
2. Confirme que todas as variáveis estão configuradas
3. Teste localmente com `npm run build` e `npm run preview`

---

**Nota**: As variáveis `VITE_*` são injetadas no código durante o build e ficam visíveis no frontend. Nunca coloque informações sensíveis nessas variáveis.