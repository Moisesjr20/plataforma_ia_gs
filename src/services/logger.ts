// Serviço centralizado de logging
// Monitora todas as operações críticas do sistema

export enum LogLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum LogCategory {
  OPENAI = 'openai',
  RAG = 'rag',
  CHAT = 'chat',
  SYSTEM = 'system',
  AUTH = 'auth'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: {
    agentId?: string;
    agentName?: string;
    userId?: string;
    query?: string;
    response?: string;
    ragContextFound?: boolean;
    ragDocumentsCount?: number;
    ragDocumentsTitles?: string[];
    openaiModel?: string;
    openaiTokensUsed?: number;
    openaiCost?: number;
    executionTime?: number;
    error?: string;
    stackTrace?: string;
    [key: string]: any;
  };
}

interface LoggerConfig {
  enabled: boolean;
  maxLogs: number;
  persistToLocalStorage: boolean;
  consoleOutput: boolean;
  levels: LogLevel[];
}

const STORAGE_KEY = 'app_logs';
const DEFAULT_MAX_LOGS = 1000;

class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    enabled: true,
    maxLogs: DEFAULT_MAX_LOGS,
    persistToLocalStorage: true,
    consoleOutput: true,
    levels: [LogLevel.INFO, LogLevel.SUCCESS, LogLevel.WARNING, LogLevel.ERROR, LogLevel.DEBUG]
  };

  constructor() {
    this.loadLogs();
  }

  /**
   * Registra uma entrada de log
   */
  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: LogEntry['metadata']
  ): LogEntry {
    if (!this.config.enabled || !this.config.levels.includes(level)) {
      return this.createLogEntry(level, category, message, metadata);
    }

    const logEntry = this.createLogEntry(level, category, message, metadata);

    // Adicionar ao array de logs
    this.logs.unshift(logEntry);

    // Limitar tamanho do array
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(0, this.config.maxLogs);
    }

    // Persistir se configurado
    if (this.config.persistToLocalStorage) {
      this.saveLogs();
    }

    // Output no console se configurado
    if (this.config.consoleOutput) {
      this.consoleOutput(logEntry);
    }

    return logEntry;
  }

  /**
   * Logs específicos para OpenAI
   */
  logOpenAI(
    message: string,
    metadata: {
      agentId?: string;
      agentName?: string;
      query?: string;
      response?: string;
      model?: string;
      tokensUsed?: number;
      cost?: number;
      executionTime?: number;
      error?: string;
    }
  ): LogEntry {
    const level = metadata.error ? LogLevel.ERROR : LogLevel.INFO;

    return this.log(level, LogCategory.OPENAI, message, {
      ...metadata,
      openaiModel: metadata.model,
      openaiTokensUsed: metadata.tokensUsed,
      openaiCost: metadata.cost
    });
  }

  /**
   * Logs específicos para RAG
   */
  logRAG(
    message: string,
    metadata: {
      agentId?: string;
      query?: string;
      contextFound?: boolean;
      documentsCount?: number;
      documentsTitles?: string[];
      executionTime?: number;
      error?: string;
    }
  ): LogEntry {
    const level = metadata.error ? LogLevel.ERROR :
                  metadata.contextFound ? LogLevel.SUCCESS : LogLevel.WARNING;

    return this.log(level, LogCategory.RAG, message, {
      ...metadata,
      ragContextFound: metadata.contextFound,
      ragDocumentsCount: metadata.documentsCount,
      ragDocumentsTitles: metadata.documentsTitles
    });
  }

  /**
   * Logs para interações de chat
   */
  logChat(
    message: string,
    metadata: {
      agentId?: string;
      agentName?: string;
      userId?: string;
      query?: string;
      response?: string;
      executionTime?: number;
      error?: string;
    }
  ): LogEntry {
    const level = metadata.error ? LogLevel.ERROR : LogLevel.INFO;
    return this.log(level, LogCategory.CHAT, message, metadata);
  }

  /**
   * Log de informação
   */
  info(category: LogCategory, message: string, metadata?: LogEntry['metadata']): LogEntry {
    return this.log(LogLevel.INFO, category, message, metadata);
  }

  /**
   * Log de sucesso
   */
  success(category: LogCategory, message: string, metadata?: LogEntry['metadata']): LogEntry {
    return this.log(LogLevel.SUCCESS, category, message, metadata);
  }

  /**
   * Log de aviso
   */
  warning(category: LogCategory, message: string, metadata?: LogEntry['metadata']): LogEntry {
    return this.log(LogLevel.WARNING, category, message, metadata);
  }

  /**
   * Log de erro
   */
  error(category: LogCategory, message: string, error?: Error | string, metadata?: LogEntry['metadata']): LogEntry {
    const errorMetadata = {
      ...metadata,
      error: typeof error === 'string' ? error : error?.message,
      stackTrace: error instanceof Error ? error.stack : undefined
    };

    return this.log(LogLevel.ERROR, category, message, errorMetadata);
  }

  /**
   * Log de debug
   */
  debug(category: LogCategory, message: string, metadata?: LogEntry['metadata']): LogEntry {
    return this.log(LogLevel.DEBUG, category, message, metadata);
  }

  /**
   * Obtém todos os logs
   */
  getLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }

      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredLogs;
  }

  /**
   * Obtém estatísticas dos logs
   */
  getStats() {
    const total = this.logs.length;
    const byLevel = this.groupBy(this.logs, 'level');
    const byCategory = this.groupBy(this.logs, 'category');

    const last24h = this.logs.filter(log => {
      const dayAgo = new Date();
      dayAgo.setHours(dayAgo.getHours() - 24);
      return log.timestamp >= dayAgo;
    });

    const openAILogs = this.logs.filter(log => log.category === LogCategory.OPENAI);
    const totalTokens = openAILogs.reduce((sum, log) => sum + (log.metadata?.openaiTokensUsed || 0), 0);
    const totalCost = openAILogs.reduce((sum, log) => sum + (log.metadata?.openaiCost || 0), 0);

    const ragLogs = this.logs.filter(log => log.category === LogCategory.RAG);
    const ragSuccessRate = ragLogs.length > 0
      ? (ragLogs.filter(log => log.metadata?.ragContextFound).length / ragLogs.length) * 100
      : 0;

    return {
      total,
      byLevel,
      byCategory,
      last24h: last24h.length,
      openai: {
        totalCalls: openAILogs.length,
        totalTokens,
        totalCost,
        averageTokensPerCall: openAILogs.length > 0 ? totalTokens / openAILogs.length : 0
      },
      rag: {
        totalQueries: ragLogs.length,
        successRate: ragSuccessRate.toFixed(2) + '%',
        successfulQueries: ragLogs.filter(log => log.metadata?.ragContextFound).length
      }
    };
  }

  /**
   * Limpa todos os logs
   */
  clearLogs(): void {
    this.logs = [];
    if (this.config.persistToLocalStorage) {
      this.saveLogs();
    }
  }

  /**
   * Exporta logs como JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Importa logs de JSON
   */
  importLogs(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        this.logs = imported.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        this.saveLogs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Métodos privados

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: LogEntry['metadata']
  ): LogEntry {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      metadata
    };
  }

  private generateId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private groupBy(items: LogEntry[], key: keyof LogEntry): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private consoleOutput(logEntry: LogEntry): void {
    const emoji = this.getEmoji(logEntry.level);
    const color = this.getColor(logEntry.level);
    const timestamp = logEntry.timestamp.toISOString();

    console.log(
      `%c${emoji} [${timestamp}] [${logEntry.category}] ${logEntry.message}`,
      `color: ${color}; font-weight: bold;`
    );

    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      console.log('%cMetadata:', 'color: gray; font-style: italic;', logEntry.metadata);
    }
  }

  private getEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.SUCCESS]: '✅',
      [LogLevel.WARNING]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.DEBUG]: '🔍'
    };
    return emojis[level] || 'ℹ️';
  }

  private getColor(level: LogLevel): string {
    const colors = {
      [LogLevel.INFO]: '#2196F3',
      [LogLevel.SUCCESS]: '#4CAF50',
      [LogLevel.WARNING]: '#FF9800',
      [LogLevel.ERROR]: '#F44336',
      [LogLevel.DEBUG]: '#9E9E9E'
    };
    return colors[level] || '#2196F3';
  }

  private saveLogs(): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erro ao salvar logs:', error);
    }
  }

  private loadLogs(): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  }
}

// Instância singleton do logger
export const logger = new Logger();
