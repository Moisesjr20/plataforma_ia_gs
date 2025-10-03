import { useState, useEffect } from 'react';
import { ragService, RAGDocument } from '@/services/rag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface RAGControlsProps {
  agentId: string;
  agentName: string;
}

export function RAGControls({ agentId, agentName }: RAGControlsProps) {
  const [config, setConfig] = useState(ragService.getConfig());
  const [documents, setDocuments] = useState<any[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [agentId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await ragService.listDocuments(agentId);
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    ragService.updateConfig(newConfig);
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    ragService.addDocument({
      content: newDocContent,
      metadata: {
        title: newDocTitle,
        category: 'custom',
        tags: [],
        agentId,
        timestamp: new Date()
      }
    });

    await loadDocuments();
    setNewDocTitle('');
    setNewDocContent('');
    setIsAddingDoc(false);
  };

  const handleRemoveDocument = async (docId: string) => {
    ragService.removeDocument(docId);
    await loadDocuments();
  };

  const handleClearAll = async () => {
    if (confirm(`Tem certeza que deseja limpar todos os documentos do agente ${agentName}?`)) {
      ragService.clearDocuments();
      await loadDocuments();
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações RAG */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 Configurações RAG - {agentName}
          </CardTitle>
          <CardDescription>
            Configure o sistema de recuperação de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="rag-enabled">Habilitar RAG</Label>
            <Switch
              id="rag-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-results">Máximo de Resultados</Label>
            <Input
              id="max-results"
              type="number"
              min="1"
              max="10"
              value={config.maxResults}
              onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="similarity-threshold">Limite de Similaridade</Label>
            <Input
              id="similarity-threshold"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.similarityThreshold}
              onChange={(e) => handleConfigChange('similarityThreshold', parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Base de Conhecimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📚 Base de Conhecimento
            <Badge variant="secondary">
              {documents.length} documento{documents.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <CardDescription>
            Gerencie os documentos de conhecimento do {agentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddingDoc(true)}
              variant="outline"
              size="sm"
            >
              ➕ Adicionar Documento
            </Button>
            {documents.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                size="sm"
              >
                🗑️ Limpar Tudo
              </Button>
            )}
          </div>

          {/* Formulário para Novo Documento */}
          {isAddingDoc && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="doc-title">Título do Documento</Label>
                <Input
                  id="doc-title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Ex: Estratégias de Marketing Digital"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-content">Conteúdo</Label>
                <Textarea
                  id="doc-content"
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Digite o conteúdo do documento..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddDocument} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingDoc(false);
                    setNewDocTitle('');
                    setNewDocContent('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de Documentos */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-center py-8">
                Carregando documentos...
              </p>
            ) : documents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum documento encontrado. Adicione conhecimento para melhorar as respostas do {agentName}.
              </p>
            ) : (
              documents.map((doc: RAGDocument) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{doc.metadata.title}</h4>
                      <p className="text-sm text-gray-500">
                        Fonte: {doc.metadata.title} • {doc.metadata.timestamp ? new Date(doc.metadata.timestamp).toLocaleDateString() : 'Data não disponível'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveDocument(doc.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {doc.content.substring(0, 200)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status RAG:</span>
              <Badge className={`ml-2 ${config.enabled ? 'bg-green-500' : 'bg-red-500'}`}>
                {config.enabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Documentos:</span>
              <span className="ml-2">{documents.length}</span>
            </div>
            <div>
              <span className="font-medium">Máx. Resultados:</span>
              <span className="ml-2">{config.maxResults}</span>
            </div>
            <div>
              <span className="font-medium">Limite Similaridade:</span>
              <span className="ml-2">{config.similarityThreshold}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}