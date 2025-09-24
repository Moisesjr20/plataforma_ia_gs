# GE IA - Plataforma de Assistentes de IA

Uma plataforma SaaS conversacional elegante que conecta usuários com três assistentes de IA especializados, cada um com sua própria personalidade e área de expertise.

## 🚀 Funcionalidades

### ✅ Autenticação Completa
- Login e cadastro via email/senha
- Integração com Supabase Auth
- Validação de formulários e tratamento de erros
- Redirecionamento automático após login

### ✅ Lobby de Assistentes IA
- **Augusto**: Agente analítico e estratégico (planejamento e insights)
- **Sofia Brander**: Especialista em branding e marketing
- **Carol SDR**: Focada em prospecção e vendas com linguagem direta

### ✅ Interface de Chat Avançada
- Chat em tempo real com cada assistente
- Histórico de mensagens por sessão
- Integração com webhooks do n8n
- Interface responsiva e moderna
- Personalidades distintas para cada IA

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Roteamento**: React Router Dom
- **Integração IA**: Webhooks n8n
- **Tipografia**: Inter Font
- **Ícones**: Lucide React

## 🎨 Design System

### Cores
- **Primary**: `#1C1C1E` (grafite escuro refinado)
- **Accent**: `#5C7CFA` (azul elegante)
- **Backgrounds**: branco puro e cinzas claros sutis

### Layout
- Mobile-first design
- UI moderna baseada em cards
- Espaçamento generoso
- Tipografia legível

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Conta no Supabase
- N8N configurado (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ge-ia-platform
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_N8N_WEBHOOK_AUGUSTO=https://seu-n8n.com/webhook/augusto
VITE_N8N_WEBHOOK_SOFIA=https://seu-n8n.com/webhook/sofia
VITE_N8N_WEBHOOK_CAROL=https://seu-n8n.com/webhook/carol
```

4. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📊 Configuração do Supabase

### Tabelas necessárias:

```sql
-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens do chat (opcional para histórico persistente)
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para chat_messages
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🤖 Integração N8N

### Configuração dos Webhooks

Cada assistente tem seu webhook personalizado que deve retornar:

```json
{
  "response": "Resposta da IA aqui..."
}
```

### Payload enviado:
```json
{
  "message": "Mensagem do usuário",
  "agent": "augusto|sofia|carol",
  "personality": "Descrição da personalidade do agente"
}
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes UI base (shadcn/ui)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Context de autenticação
├── data/
│   └── agents.ts        # Dados dos assistentes IA
├── hooks/
│   └── useChat.ts       # Hook para chat functionality
├── lib/
│   ├── supabase.ts      # Configuração Supabase
│   └── utils.ts         # Utilitários
├── pages/
│   ├── Login.tsx        # Página de login
│   ├── Register.tsx     # Página de cadastro
│   ├── Lobby.tsx        # Lobby dos assistentes
│   └── Chat.tsx         # Interface de chat
├── types/
│   └── index.ts         # Definições TypeScript
├── App.tsx              # Componente principal
├── App.css              # Estilos globais
└── main.tsx             # Entry point
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📱 Responsividade

A aplicação é totalmente responsiva com:
- Layout mobile-first
- Grid adaptativo para diferentes tamanhos de tela
- Interface de chat otimizada para mobile e desktop
- Navigation fluída em todos os dispositivos

## 🔒 Segurança

- Autenticação segura via Supabase
- Rotas protegidas
- Validação de entrada
- Row Level Security (RLS) no Supabase
- Sanitização de dados

## 🎯 Próximos Passos

- [ ] Histórico persistente de chat
- [ ] Notificações em tempo real
- [ ] Temas personalizáveis
- [ ] Analytics de uso
- [ ] Integração com mais provedores de IA
- [ ] Sistema de feedback
- [ ] Modo offline

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido com ❤️ usando React + TypeScript + Supabase