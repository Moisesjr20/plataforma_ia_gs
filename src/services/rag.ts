import KNOWLEDGE_BASE from '@/data/knowledgeBase.json';
import { getEmbedding } from './openai';
import { logger, LogCategory } from './logger';

interface RAGDocumentMetadata {
  source?: string;
  category?: string;
  tags?: string[];
  agentId?: string;
  timestamp?: Date;
  title?: string;
}

export interface RAGDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: RAGDocumentMetadata;
}

interface KnowledgeBase {
  documents: any[];
}

export class RAGService {
  private documents: RAGDocument[] = [];
  private embeddingCache: Map<string, number[]> = new Map(); // Cache de embeddings
  private isCalculatingEmbeddings: boolean = false; // Flag para evitar cálculos duplicados
  private config = {
    enabled: true,
    threshold: 0.7,
    maxResults: 5,
    similarityThreshold: 0.7,
    contextWindow: 4000
  };

  constructor() {
    this.initializeKnowledgeBase();
  }

  getConfig() {
    return this.config;
  }

  updateConfig(newConfig: any) {
    this.config = { ...this.config, ...newConfig };
  }

  async listDocuments(agentId?: string): Promise<RAGDocument[]> {
    if (agentId) {
      return this.documents.filter(doc => 
        doc.metadata?.agentId === agentId || 
        doc.metadata?.category === 'general'
      );
    }
    return this.documents;
  }

  addDocument(document: Omit<RAGDocument, 'id' | 'embedding'>) {
    const newDoc: RAGDocument = {
      id: Date.now().toString(),
      ...document,
      embedding: [] // Será calculado quando necessário
    };
    this.documents.push(newDoc);
  }

  removeDocument(docId: string) {
    this.documents = this.documents.filter(doc => doc.id !== docId);
  }

  clearDocuments() {
    this.documents = [];
    this.initializeKnowledgeBase(); // Recarrega documentos base
  }

  private initializeKnowledgeBase() {
    // Documentos base sobre Imersão Turbinar
    this.documents = [
      {
        id: 'imersao-turbinar-overview',
        content: `A Imersão Turbinar é um programa intensivo de 3 dias focado em estratégias de marketing digital e vendas. O programa é estruturado para ensinar desde conceitos básicos até estratégias avançadas de conversão.

        Cronograma:
        - Dia 1: Fundamentos e Posicionamento
        - Dia 2: Estratégias de Conteúdo e Copywriting
        - Dia 3: Funis de Vendas e Conversão

        Investimento: R$ 497,00 (valor promocional)
        Valor normal: R$ 997,00

        Inclui:
        - 3 aulas ao vivo
        - Material complementar
        - Grupo VIP no Telegram
        - Bônus exclusivos
        - Certificado de participação`,
        metadata: {
          source: 'Resumo Detalhado da Aula Imersão Turbinar',
          category: 'programa',
          tags: ['imersao', 'turbinar', 'marketing', 'vendas'],
          agentId: 'augusto',
          title: 'Imersão Turbinar - Visão Geral'
        },
        embedding: []
      },
      {
        id: 'dia-1-fundamentos',
        content: `Primeiro dia da Imersão Turbinar focado em estabelecer bases sólidas:

        Tópicos principais:
        - Definição de nicho e posicionamento
        - Análise de concorrência
        - Criação de persona detalhada
        - Estratégias de diferenciação
        - Fundamentos de copywriting
        - Estrutura de ofertas irresistíveis

        Exercícios práticos:
        - Workshop de posicionamento
        - Criação de avatar do cliente ideal
        - Análise SWOT pessoal`,
        metadata: {
          source: 'Resumo Detalhado da Aula Imersão Turbinar',
          category: 'aula',
          tags: ['dia-1', 'fundamentos', 'posicionamento'],
          agentId: 'augusto',
          title: 'Dia 1 - Fundamentos e Posicionamento'
        },
        embedding: []
      },
      {
        id: 'dia-2-conteudo',
        content: `Segundo dia focado em criação de conteúdo e copywriting avançado:

        Conteúdo programático:
        - Frameworks de copywriting (AIDA, PAS, Before/After/Bridge)
        - Criação de headlines magnéticas
        - Storytelling para vendas
        - Gatilhos mentais e persuasão
        - Estrutura de e-mails de vendas
        - Copy para redes sociais

        Atividades:
        - Criação de 10 headlines
        - Escrita de história pessoal de vendas
        - Desenvolvimento de sequência de e-mails`,
        metadata: {
          source: 'Resumo Detalhado da Aula Imersão Turbinar',
          category: 'aula',
          tags: ['dia-2', 'copywriting', 'conteudo'],
          agentId: 'augusto',
          title: 'Dia 2 - Estratégias de Conteúdo e Copywriting'
        },
        embedding: []
      },
      {
        id: 'dia-3-funis',
        content: `Terceiro dia dedicado à construção de funis de vendas eficazes:

        Módulos:
        - Arquitetura de funis de vendas
        - Páginas de captura de alta conversão
        - Sequências de e-mail marketing
        - Upsells e downsells estratégicos
        - Métricas e otimização
        - Automação de vendas

        Projetos:
        - Mapeamento do funil completo
        - Criação de página de captura
        - Configuração de automação básica`,
        metadata: {
          source: 'Resumo Detalhado da Aula Imersão Turbinar',
          category: 'aula',
          tags: ['dia-3', 'funis', 'conversao'],
          agentId: 'augusto',
          title: 'Dia 3 - Funis de Vendas e Conversão'
        },
        embedding: []
      },
      {
        id: 'investimento-detalhes',
        content: `Informações completas sobre investimento e condições:

        Valor promocional: R$ 497,00
        Valor normal: R$ 997,00
        Desconto: 50% (economia de R$ 500,00)

        Formas de pagamento:
        - À vista: R$ 497,00 (PIX/Cartão)
        - Parcelado: 12x de R$ 49,70 (cartão de crédito)

        Garantia: 7 dias incondicionais
        - Satisfação total ou dinheiro de volta
        - Sem perguntas, sem burocracia

        Bônus inclusos:
        - E-book "50 Headlines que Vendem"
        - Template de funil de vendas
        - Planilha de métricas
        - Acesso ao grupo VIP por 30 dias`,
        metadata: {
          source: 'Resumo Detalhado da Aula Imersão Turbinar',
          category: 'comercial',
          tags: ['investimento', 'preco', 'garantia'],
          agentId: 'augusto',
          title: 'Detalhes do Investimento'
        },
        embedding: []
      },
      {
        id: 'framework-c1-c2-c3-p3',
        content: `Framework C1, C2, C3 e Conteúdo P.3 (Provo Que Resolvo):

        **C1 - Consciência do Problema:**
        - Cliente reconhece que tem um problema
        - Ainda não sabe que existe solução
        - Conteúdo educativo sobre o problema
        - Foco em despertar a dor e urgência

        **C2 - Consciência da Solução:**
        - Cliente sabe que existe uma solução
        - Não conhece seu produto/serviço específico
        - Conteúdo sobre diferentes tipos de solução
        - Comparações e análises de mercado

        **C3 - Consciência do Produto:**
        - Cliente conhece seu produto/serviço
        - Precisa ser convencido a comprar
        - Demonstrações, cases de sucesso
        - Comparações diretas com concorrentes

        **P.3 - Provo Que Resolvo:**
        - Conteúdo que demonstra competência
        - Cases reais, resultados obtidos
        - Depoimentos e social proof
        - Demonstrações práticas de expertise

        Aplicação estratégica:
        - C1: Blog posts educativos, vídeos informativos
        - C2: Comparativos, guias de escolha
        - C3: Demos, trials, casos de uso
        - P.3: Portfólio, testimonials, case studies`,
        metadata: {
          source: 'Framework C1, C2, C3 e Conteúdo P.3',
          category: 'estrategia',
          tags: ['framework', 'consciencia', 'marketing', 'funil'],
          agentId: 'augusto',
          title: 'Framework C1, C2, C3 e Conteúdo P.3'
        },
        embedding: []
      },
      {
        id: 'melhores-conteudos-c3',
        content: `Melhores tipos de conteúdo para C3 (Consciência do Produto):

        **Demonstrações e Provas:**
        - Vídeos de demonstração do produto
        - Screenshots e walkthroughs
        - Comparações lado a lado
        - Testes e reviews independentes

        **Social Proof:**
        - Depoimentos em vídeo
        - Cases de sucesso detalhados
        - Números e estatísticas de resultados
        - Certificações e prêmios

        **Conteúdo de Conversão:**
        - Webinars de vendas
        - Consultorias gratuitas
        - Trials e amostras grátis
        - Garantias e políticas de reembolso

        **Superação de Objeções:**
        - FAQ detalhado
        - Comparações com concorrentes
        - Explicação de diferenciais
        - Histórias de transformação

        **Urgência e Escassez:**
        - Ofertas por tempo limitado
        - Bônus exclusivos
        - Vagas limitadas
        - Preços promocionais`,
        metadata: {
          source: 'Melhores Conteúdos para C3',
          category: 'estrategia',
          tags: ['c3', 'conversao', 'vendas', 'conteudo'],
          agentId: 'augusto',
          title: 'Melhores Conteúdos para C3'
        },
        embedding: []
      },
      {
        id: 'doc-c2-provo-que-entendo',
        content: `O Conteúdo C.2 'Provo Que Entendo' é uma estratégia de comunicação para demonstrar profundidade e autoridade no nicho. Diferente de conteúdos superficiais, o C.2 aprofunda em conceitos, apresenta metodologias e explica detalhadamente soluções para problemas do público.

IMPORTÂNCIA: Constrói confiança, diferenciação pela profundidade, conversão indireta através de conteúdos de autoridade, e aumento de engajamento.

ESTRUTURA DO CONTEÚDO C.2:
1. PROBLEMA (Abertura/Gancho): Identifique a dor do público-alvo usando perguntas provocativas ou cenários de identificação
2. CONTEXTO E DIAGNÓSTICO: Explique causas do problema com profundidade, traga estudos de caso, estatísticas relevantes ou exemplos práticos
3. APRESENTAÇÃO DO MÉTODO/SOLUÇÃO: Mostre método ou solução validada com passo a passo, checklist ou estrutura clara
4. DEMONSTRAÇÃO PRÁTICA: Mostre caso real ou simulação com imagens, gráficos ou textos explicativos
5. CONCLUSÃO E CHAMADA PARA AÇÃO: Resuma pontos principais e faça CTA clara

FORMATOS INDICADOS: Vídeos longos (2-3 min) mostrando passo a passo, Carrosséis detalhados com cada slide explorando ponto-chave.

PADRÕES QUE FUNCIONAM:
- Abertura com perguntas provocativas ou dores reais
- Quebra de crenças limitantes
- Autoridade sutil com storytelling
- Demonstração de oportunidade de mercado inexplorada
- Frameworks mentais implícitos (Diagnóstico → Nova Visão → Direcionamento → Prova Social → Chamada)
- Linguagem direta + tom de conversa + leve provocação

GATILHOS DE COPY: Autoridade por contraste, Prova Social Estratégica, Crença e Mentalidade, Urgência latente, Identidade Premium.

FRAMEWORK M.I.R.A.: Mindset (quebre a crença), Insight (nova percepção), Roteiro (o que fazer diferente), Ação (estimule aplicação).`,
        metadata: {
          source: 'Conteúdo C2 ou Provo que Entendo',
          category: 'estrategia',
          tags: ['conteudo-c2', 'autoridade', 'copywriting', 'conversao', 'educacao', 'metodologia'],
          agentId: 'augusto',
          title: 'Conteúdo C2 - Provo Que Entendo'
        },
        embedding: []
      },
      {
        id: 'doc-frameworks-copy-c1',
        content: `CONTEÚDO C1 - Conversacional e pessoal, como conversa com alguém próximo. Storytelling que conta cases e histórias.

ESTRUTURA BÁSICA:
Hook → Conteúdo de Valor → CTA
No conteúdo de valor, adicionar material educacional que aumente conversão da CTA.

ESTRUTURA ALTERNATIVA:
Promessa → Problema → Causa → Solução → Oferta
OU: Headline → Abertura → Conteúdo → Oferta

TEMPLATES PRINCIPAIS:

TEMPLATE 01 - PERGUNTA AO INVÉS DE PROMESSA:
Transforma promessas agressivas em perguntas que desarmam objeções. Ex: 'É realmente possível derreter 3-5kg em 7 dias sem academia?'
Estrutura: Headline (pergunta) → Abertura (meia-verdade) → Solução/Benefícios (passos) → Oferta

TEMPLATE 02 - PROMETA ALGO ÚTIL:
'Como evitar o maior erro que você pode cometer ao [desejo do público]'. Foca em SALVAR o público de problemas.
Estrutura: Headline (maior erro) → Abertura (explicação do problema) → Apresentação dos dois caminhos → Revelação do erro → Solução → Oferta

TEMPLATE 03 - REVELE UM SEGREDO:
'A ÚNICA coisa que você precisa saber para [desejo]'. Quebra argumentos óbvios e apresenta algo novo.
Estrutura: Headline (única coisa) → Abertura (quebra do óbvio) → Solução/Benefícios → Oferta

TEMPLATE 04 - CONTRADIÇÃO:
'Como Vender Mais Produzindo Menos Conteúdo'. Apresenta algo que parece impossível mas é justificável.

TEMPLATE 05 - PROMESSAS ULTRA ESPECÍFICAS:
'Como gerar 7 dias de lucro todas as semanas durante 1 ano'. Específica, ganho imediato + longo prazo.

TEMPLATE 06 - CHECKLIST GRATUITO:
'3 Perguntas Que Você Precisa Fazer ANTES de contratar [serviço]'. Usa medo de cometer erros na contratação.

TEMPLATE 07 - COMO CONSEGUIR MUITO MAIS:
'Como Vender MUITO MAIS em 2025'. Foco em fazer MENOS para conseguir MUITO MAIS.

TEMPLATE 08 - REVELE UM SEGREDO DE PREPARAÇÃO:
'Como eu me preparei para [resultado]'. Ideia de bastidores e confissão.

TEMPLATE 09 - REVELE O QUE IRÁ ACONTECER:
Usado no encerramento de ofertas. Explica o porquê do programa ser diferente.

TEMPLATE 10 - ENTREGUE LISTA GRATUITA:
'10 modelos/templates de XYZ'. Muitas opções geram dúvidas, criando necessidade de orientação.

FRAMEWORK AIDA: Atenção → Interesse → Desejo → Ação

CARACTERÍSTICAS C1 CONVERSACIONAL:
- Tom próximo e direto (2ª pessoa, perguntas retóricas)
- Estrutura clara em blocos
- Storytelling rápido e visual
- Empatia + vulnerabilidade
- Linguagem coloquial mas precisa
- Gatilhos psicológicos integrados
- Mini-passos práticos
- CTA único e enxuto
- Ritmo de conversa`,
        metadata: {
          source: 'Bons Framework de Copy para C1',
          category: 'frameworks',
          tags: ['c1', 'copywriting', 'templates', 'conversao', 'storytelling'],
          agentId: 'augusto',
          title: 'Frameworks de Copy para C1'
        },
        embedding: []
      },
      {
        id: 'doc-frameworks-c2',
        content: `FRAMEWORK CARROSSEL - Descendo Nível de Consciência + Prova Social + CTA

ESTRATÉGIAS DE COPY:
1. PROMESSA ATRAENTE (Headline): Promessa específica que chama atenção imediatamente
2. DESMISTIFICAÇÃO: Explica o que NÃO foi necessário para alcançar resultado, desafiando suposições
3. CONTRASTE: Contrasta ações comuns com solução eficaz
4. AUTORIDADE E CREDIBILIDADE: Usa experiência prévia e resultados para credibilidade
5. SOCIAL PROOF (Prova Social): Mostra mensagens de clientes com resultados
6. CHAMADA PARA AÇÃO: CTA clara e simples

FRAMEWORK UTILIZADO:
- Atenção: Headline com promessa específica
- Interesse: Desmistificação do que não é necessário
- Desejo: Solução + credibilidade + prova social
- Ação: CTA claro

ESTRUTURA GERAL:
Problema → Agitação → Solução → Prova → Chamada para Ação

EXEMPLO PRÁTICO:
'Como faturei R$75.000 somente com coaching individual nos últimos 15 dias'
- Não foi lotando agenda
- Não foi usando lista de conhecidos
- Foi cobrando valor alto e mantendo qualidade de vida
- Prova: depoimentos de mentorados
- CTA: 'Digite ALTO VALOR nos comentários'

FRAMEWORK QUEBRA DE OBJEÇÃO:
1. Apresente objeção comum
2. Mostre provas contrárias
3. Demonstre que não é limitante
4. Use casos reais como exemplo
5. Apresente sua metodologia
6. Mostre duas opções (com/sem você)
7. CTA para quem escolheu acompanhamento

CARACTERÍSTICAS C2:
- Educação profunda
- Mudança de percepção
- Preparação para compra
- Autoridade velada
- Prova social estratégica
- Tom conversacional com profundidade`,
        metadata: {
          source: 'Bons Frameworks de C2',
          category: 'frameworks',
          tags: ['c2', 'frameworks', 'carrossel', 'prova-social', 'autoridade', 'objecoes'],
          agentId: 'augusto',
          title: 'Bons Frameworks de C2'
        },
        embedding: []
      },
      {
        id: 'doc-estruturas-copy',
        content: `TIPOS DE CONTEÚDO C1 QUE PERFORMAM BEM:

LÓGICA: Atenção → Interesse → Desejo → Ação
OU: Promessa → Problema → Causa → Solução → Oferta
OU: Headline → Abertura → Conteúdo → Oferta

PROMESSA: Ganho, alívio, segurança, previsibilidade
PROBLEMA: Medo, bloqueio, insegurança

4 VARIAÇÕES MAIS COMUNS:
1. Foco maior em promessa
2. Foco maior em problema
3. Foco maior na conversa
4. Storytelling formato conversacional

ESTRUTURA DE STORYTELLING DE TRANSFORMAÇÃO:

1. CENA COTIDIANA COM DOR/DÚVIDA (Abertura)
   - Situação realista representando dor ou vazio
   - Algo vivido, relatado por cliente, ou história hipotética
   Exemplo: 'Lá estava ela, 10 anos mesma profissão, estável mas com vazio...'

2. DESEJO INTERNO/INCONFORMISMO (Chamada à Mudança)
   - Momento que nasce incômodo com situação
   - Ativa identificação do público
   Exemplo: 'Queria voltar a sentir brilho nos olhos...'

3. VIRADA PESSOAL (Decisão/Quebra de Padrão)
   - Ponto de virada que inicia transformação
   - Mostra autoridade emocional
   Exemplo: 'Esse desejo me fez largar advocacia...'

4. APRENDIZADOS E SOLUÇÃO (Descoberta do Novo Caminho)
   - Chave que permitiu mudança: método, novo olhar, hábitos
   - Coração estratégico do conteúdo
   Exemplo: 'Descobri que não era trocar profissão, era reconectar valores...'

5. CONVITE AO LEITOR (Identificação + CTA)
   - Mensagem inspiradora validando audiência
   - Convite leve, empático e inclusivo
   Exemplo: 'Se sente nova versão querendo emergir, me siga...'

CONTEÚDO EM FORMATO DE LISTA:

CONCEITO: Organiza ideias de forma numerada, objetiva e sequencial - fácil consumir, lembrar e aplicar.

CARACTERÍSTICAS:
- Clareza: direto ao ponto
- Organização lógica: numerada/marcadores
- Escaneabilidade: captação rápida
- Entrega rápida de valor
- Abertura com promessa clara
- Aplicabilidade prática
- Estrutura modular
- Alta compartilhabilidade

ESTRUTURA LISTA:
1. Headline/Gancho: apresenta o porquê
2. Mini-introdução (opcional): contextualiza
3. Lista com 3, 5, 7 ou 10 itens: insights diretos
4. Encerramento com CTA suave

TIPOS DE LISTA:
- Passo a passo (educativo)
- Lista de erros
- Checklist/Diagnóstico
- Listas inspiracionais
- Listas comparativas
- Ferramentas/Recursos

GATILHOS MENTAIS:
- Curiosidade: '3 coisas que ninguém te contou...'
- Prova: 'Esses 5 passos ajudaram 100 mulheres...'
- Autoridade: 'O que aprendi em 10 anos...'
- Escassez/urgência: 'Se está fazendo item 4, pare agora'
- Organização mental: alivia confusão e mostra caminho`,
        metadata: {
          source: 'Estruturas de Copy',
          category: 'estrategia',
          tags: ['estruturas', 'storytelling', 'listas', 'transformacao', 'gatilhos-mentais'],
          agentId: 'augusto',
          title: 'Estruturas de Copy'
        },
        embedding: []
      }
    ];
  }

  /**
   * Calcula embedding com cache para evitar recálculos
   */
  private async getOrCalculateEmbedding(docId: string, content: string): Promise<number[]> {
    // Verificar cache primeiro
    if (this.embeddingCache.has(docId)) {
      return this.embeddingCache.get(docId)!;
    }

    try {
      const startTime = Date.now();
      const embedding = await getEmbedding(content);
      const executionTime = Date.now() - startTime;

      // Armazenar no cache
      this.embeddingCache.set(docId, embedding);

      logger.debug(LogCategory.RAG, `Embedding calculado para documento ${docId}`, {
        executionTime,
        contentLength: content.length
      });

      return embedding;
    } catch (error) {
      logger.error(LogCategory.RAG, `Erro ao calcular embedding para ${docId}`, error as Error);
      throw error;
    }
  }

  async searchKnowledgeBase(query: string): Promise<RAGDocument[]> {
    const startTime = Date.now();

    try {
      const queryEmbedding = await getEmbedding(query);

      let results: (RAGDocument & { similarity: number })[] = [];

      // Busca nos documentos internos
      for (const doc of this.documents) {
        let docEmbedding = doc.embedding;

        // Calcular embedding se ainda não estiver disponível
        if (!docEmbedding || docEmbedding.length === 0) {
          try {
            docEmbedding = await this.getOrCalculateEmbedding(doc.id, doc.content);
            // Atualizar o documento com o embedding calculado
            doc.embedding = docEmbedding;
          } catch (embeddingError) {
            logger.warning(LogCategory.RAG, `Documento ${doc.id} ignorado - falha ao calcular embedding`, {
              error: (embeddingError as Error).message
            });
            continue; // Pular este documento
          }
        }

        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        results.push({ ...doc, similarity });
      }

      // Busca no knowledge base JSON se disponível
      if (KNOWLEDGE_BASE && (KNOWLEDGE_BASE as KnowledgeBase).documents) {
        for (const item of (KNOWLEDGE_BASE as KnowledgeBase).documents) {
          // Verificar se o documento tem agentId 'augusto' ou nenhuma restrição de agentId
          if (!item.metadata?.agentId || item.metadata.agentId === 'augusto') {
            let docEmbedding = item.embedding || [];
            const docId = item.id || 'kb-' + Math.random().toString(36).substr(2, 9);
            const docContent = item.content || item.text || '';

            // Calcular embedding se ainda não estiver disponível
            if (!docEmbedding || docEmbedding.length === 0) {
              try {
                docEmbedding = await this.getOrCalculateEmbedding(docId, docContent);
              } catch (embeddingError) {
                logger.warning(LogCategory.RAG, `Documento ${docId} ignorado - falha ao calcular embedding`, {
                  error: (embeddingError as Error).message
                });
                continue; // Pular este documento
              }
            }

            const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
            results.push({
              id: docId,
              content: docContent,
              similarity,
              embedding: docEmbedding,
              metadata: {
                ...item.metadata,
                title: item.title || 'Knowledge Base Item'
              }
            });
          }
        }
      }

      // Ordena por similaridade e filtra por threshold
      results = results
        .filter(result => result.similarity >= this.config.similarityThreshold)
        .sort((a, b) => b.similarity - a.similarity);

      const topResults = results.slice(0, this.config.maxResults);
      const executionTime = Date.now() - startTime;

      // Log da busca RAG
      logger.logRAG('Busca RAG concluída', {
        query,
        contextFound: topResults.length > 0,
        documentsCount: topResults.length,
        documentsTitles: topResults.map(r => r.metadata.title || r.id),
        executionTime
      });

      return topResults;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.logRAG('Erro na busca RAG', {
        query,
        contextFound: false,
        documentsCount: 0,
        executionTime,
        error: (error as Error).message
      });
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
      return 0;
    }
    
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  buildContext(documents: RAGDocument[]): string {
    let context = '';
    let currentLength = 0;

    for (const doc of documents) {
      const docText = `Título: ${doc.metadata.title || 'Sem título'}\nConteúdo: ${doc.content}\n\n`;
      
      if (currentLength + docText.length > this.config.contextWindow) {
        break;
      }
      
      context += docText;
      currentLength += docText.length;
    }

    return context;
  }

  async getRelevantContext(query: string): Promise<string | null> {
    if (!this.config.enabled) return null;
    
    const results = await this.searchKnowledgeBase(query);
    
    if (results.length === 0) return null;
    
    return this.buildContext(results);
  }
}

// Instância global do serviço RAG
export const ragService = new RAGService();

// Função de conveniência para busca rápida
export async function searchKnowledgeBase(query: string) {
  return ragService.searchKnowledgeBase(query);
}