import { AIAgent } from '@/types'

export const AI_AGENTS: AIAgent[] = [
  {
    id: 'augusto',
    name: 'Augusto',
    description: 'Agente analítico e estratégico especializado em planejamento e insights de negócios',
    personality: 'Analítico, estratégico e focado em dados. Oferece insights profundos sobre planejamento empresarial e análise de mercado.',
    webhookUrl: import.meta.env.VITE_WEBHOOK_AUGUSTO || 'https://webhook.dev.kyrius.com.br/webhook/augusto',
    color: '#2563eb'
  },
  {
    id: 'sofia',
    name: 'Sofia Brander',
    description: 'Especialista em branding e marketing com foco em construção de marca e estratégias criativas',
    personality: 'Criativa, inovadora e especialista em branding. Desenvolve estratégias de marketing impactantes e identidade visual forte.',
    webhookUrl: import.meta.env.VITE_WEBHOOK_SOFIA || 'https://webhook.dev.kyrius.com.br/webhook/sofia',
    color: '#dc2626'
  },
  {
    id: 'carol',
    name: 'Carol SDR',
    description: 'Focada em prospecção e vendas com linguagem direta e persuasiva para acelerar negócios',
    personality: 'Direta, persuasiva e orientada a resultados. Especialista em prospecção, vendas consultivas e fechamento de negócios.',
    webhookUrl: import.meta.env.VITE_WEBHOOK_CAROL || 'https://webhook.dev.kyrius.com.br/webhook/carol',
    color: '#059669'
  }
]