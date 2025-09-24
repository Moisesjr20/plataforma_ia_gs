# Deploy no EasyPanel - Plataforma GE IA

## 📋 Pré-requisitos

- Conta no EasyPanel
- Repositório Git configurado
- Variáveis de ambiente configuradas

## 🚀 Configuração no EasyPanel

### 1. Criar Nova Aplicação

1. Acesse seu painel do EasyPanel
2. Clique em "Create New App"
3. Selecione "Docker" como tipo de aplicação
4. Configure o repositório Git

### 2. Configurações da Aplicação

**Configurações Básicas:**
- **Nome:** ge-ia-platform
- **Porta:** 80
- **Dockerfile:** `Dockerfile` (na raiz do projeto)

**Variáveis de Ambiente Obrigatórias:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=production
```

**Variáveis de Ambiente Opcionais (Webhooks):**
```
VITE_WEBHOOK_AUGUSTO=https://webhook.dev.kyrius.com.br/webhook/augusto
VITE_WEBHOOK_SOFIA=https://webhook.dev.kyrius.com.br/webhook/sofia
VITE_WEBHOOK_CAROL=https://webhook.dev.kyrius.com.br/webhook/carol
```

### 3. Configurações de Deploy

**Build Settings:**
- Build Command: Automático (via Dockerfile)
- Build Context: `/` (raiz do projeto)

**Runtime Settings:**
- Memory Limit: 512MB (recomendado)
- CPU Limit: 0.5 cores (recomendado)

### 4. Domínio e SSL

1. Configure seu domínio personalizado
2. Ative SSL automático (Let's Encrypt)
3. Configure redirecionamento HTTPS

## 🔧 Comandos Úteis

### Build Local (Teste)
```bash
# Build da imagem Docker
docker build -t ge-ia-platform .

# Executar localmente
docker run -p 80:80 --env-file .env ge-ia-platform
```

### Deploy via Docker Compose (Teste Local)
```bash
# Subir aplicação
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar aplicação
docker-compose down
```

## 📁 Estrutura de Arquivos para Deploy

```
projeto/
├── Dockerfile              # Configuração Docker
├── .dockerignore           # Arquivos ignorados no build
├── docker-compose.yml      # Para testes locais
├── .env.example           # Template de variáveis
├── package.json           # Dependências Node.js
├── vite.config.ts         # Configuração Vite
└── src/                   # Código fonte
```

## 🔍 Verificações Pós-Deploy

1. **Saúde da Aplicação:**
   - Acesse a URL da aplicação
   - Verifique se o login funciona
   - Teste a seleção de agentes

2. **Webhooks:**
   - Teste envio de mensagens
   - Verifique logs de erro no painel

3. **Performance:**
   - Monitore uso de CPU/Memória
   - Verifique tempos de resposta

## 🚨 Troubleshooting

### Problemas Comuns:

**Build Falha:**
- Verifique se todas as dependências estão no package.json
- Confirme se o Node.js 18+ está sendo usado

**Aplicação não Carrega:**
- Verifique variáveis de ambiente
- Confirme se a porta 80 está exposta

**Webhooks não Funcionam:**
- Verifique URLs dos webhooks
- Confirme conectividade de rede

### Logs Úteis:
```bash
# Ver logs da aplicação no EasyPanel
# Acesse: App > Logs > Application Logs

# Logs de build
# Acesse: App > Logs > Build Logs
```

## 📞 Suporte

Para problemas específicos do EasyPanel, consulte:
- Documentação oficial do EasyPanel
- Suporte técnico da plataforma