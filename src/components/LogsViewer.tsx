import { useState, useEffect } from 'react';
import { logger, LogEntry, LogLevel, LogCategory } from '@/services/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filtros
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();

    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000); // Atualiza a cada 2 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [logs, levelFilter, categoryFilter, searchTerm]);

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
    setStats(logger.getStats());
  };

  const applyFilters = () => {
    const filtered = logger.getLogs({
      level: levelFilter || undefined,
      category: categoryFilter || undefined,
      search: searchTerm || undefined
    });
    setFilteredLogs(filtered);
  };

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const handleExportLogs = () => {
    const data = logger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadgeColor = (level: LogLevel): string => {
    const colors = {
      [LogLevel.INFO]: 'bg-blue-500',
      [LogLevel.SUCCESS]: 'bg-green-500',
      [LogLevel.WARNING]: 'bg-yellow-500',
      [LogLevel.ERROR]: 'bg-red-500',
      [LogLevel.DEBUG]: 'bg-gray-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  const getCategoryBadgeColor = (category: LogCategory): string => {
    const colors = {
      [LogCategory.OPENAI]: 'bg-purple-500',
      [LogCategory.RAG]: 'bg-indigo-500',
      [LogCategory.CHAT]: 'bg-teal-500',
      [LogCategory.SYSTEM]: 'bg-gray-600',
      [LogCategory.AUTH]: 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-gray-500">Últimas 24h: {stats?.last24h || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chamadas OpenAI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openai?.totalCalls || 0}</div>
            <p className="text-xs text-gray-500">
              Tokens: {stats?.openai?.totalTokens?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500">
              Custo: ${stats?.openai?.totalCost?.toFixed(4) || '0.0000'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultas RAG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rag?.totalQueries || 0}</div>
            <p className="text-xs text-gray-500">
              Taxa de Sucesso: {stats?.rag?.successRate || '0%'}
            </p>
            <p className="text-xs text-gray-500">
              Com contexto: {stats?.rag?.successfulQueries || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.byLevel?.error || 0}
            </div>
            <p className="text-xs text-gray-500">
              Avisos: {stats?.byLevel?.warning || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🔍 Filtros e Ações
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
              >
                {autoRefresh ? '⏸️ Pausar' : '▶️ Auto-refresh'}
              </Button>
              <Button onClick={loadLogs} variant="outline" size="sm">
                🔄 Atualizar
              </Button>
              <Button onClick={handleExportLogs} variant="outline" size="sm">
                💾 Exportar
              </Button>
              <Button onClick={handleClearLogs} variant="destructive" size="sm">
                🗑️ Limpar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nível</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LogLevel | '')}
              >
                <option value="">Todos</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.SUCCESS}>Sucesso</option>
                <option value={LogLevel.WARNING}>Aviso</option>
                <option value={LogLevel.ERROR}>Erro</option>
                <option value={LogLevel.DEBUG}>Debug</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as LogCategory | '')}
              >
                <option value="">Todas</option>
                <option value={LogCategory.OPENAI}>OpenAI</option>
                <option value={LogCategory.RAG}>RAG</option>
                <option value={LogCategory.CHAT}>Chat</option>
                <option value={LogCategory.SYSTEM}>Sistema</option>
                <option value={LogCategory.AUTH}>Autenticação</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Busca</Label>
              <Input
                type="text"
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Logs do Sistema</CardTitle>
          <CardDescription>
            Mostrando {filteredLogs.length} de {logs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum log encontrado
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-gray-50"
                >
                  {/* Header do Log */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getLevelBadgeColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <Badge className={getCategoryBadgeColor(log.category)}>
                        {log.category.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Mensagem */}
                  <p className="font-medium">{log.message}</p>

                  {/* Metadata */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="bg-gray-100 rounded p-3 text-xs space-y-1">
                      {log.metadata.agentName && (
                        <div>
                          <strong>Agente:</strong> {log.metadata.agentName}
                        </div>
                      )}
                      {log.metadata.query && (
                        <div>
                          <strong>Consulta:</strong> {log.metadata.query}
                        </div>
                      )}
                      {log.metadata.ragContextFound !== undefined && (
                        <div>
                          <strong>RAG Encontrou Contexto:</strong>{' '}
                          {log.metadata.ragContextFound ? '✅ Sim' : '❌ Não'}
                        </div>
                      )}
                      {log.metadata.ragDocumentsCount !== undefined && (
                        <div>
                          <strong>Documentos RAG:</strong> {log.metadata.ragDocumentsCount}
                        </div>
                      )}
                      {log.metadata.ragDocumentsTitles && log.metadata.ragDocumentsTitles.length > 0 && (
                        <div>
                          <strong>Documentos:</strong>{' '}
                          {log.metadata.ragDocumentsTitles.join(', ')}
                        </div>
                      )}
                      {log.metadata.openaiModel && (
                        <div>
                          <strong>Modelo:</strong> {log.metadata.openaiModel}
                        </div>
                      )}
                      {log.metadata.openaiTokensUsed !== undefined && (
                        <div>
                          <strong>Tokens:</strong> {log.metadata.openaiTokensUsed}
                        </div>
                      )}
                      {log.metadata.openaiCost !== undefined && (
                        <div>
                          <strong>Custo:</strong> ${log.metadata.openaiCost.toFixed(6)}
                        </div>
                      )}
                      {log.metadata.executionTime !== undefined && (
                        <div>
                          <strong>Tempo:</strong> {log.metadata.executionTime}ms
                        </div>
                      )}
                      {log.metadata.error && (
                        <div className="text-red-600">
                          <strong>Erro:</strong> {log.metadata.error}
                        </div>
                      )}
                      {log.metadata.response && (
                        <div>
                          <strong>Resposta:</strong> {log.metadata.response}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
