const fs = require('fs/promises');
const path = require('path');
const { processPdf } = require('../src/services/pdfProcessor');
const { getEmbedding } = require('../src/services/openai');

const knowledgeBasePath = path.resolve(__dirname, '../base deconhecimento');
const outputPath = path.resolve(__dirname, '../src/data/knowledgeBase.json');

async function updateKnowledgeBase() {
  try {
    const files = await fs.readdir(knowledgeBasePath);
    const pdfFiles = files.filter((file) => file.endsWith('.pdf'));

    // I will create the full knowledge base object, not just the array.
    const knowledgeBase = {
      version: "1.0.0",
      lastUpdate: new Date().toISOString(),
      totalDocuments: 0,
      documents: []
    };

    for (const pdfFile of pdfFiles) {
      console.log(`Processing ${pdfFile}...`);
      const filePath = path.join(knowledgeBasePath, pdfFile);
      const chunks = await processPdf(filePath);

      for (const chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        knowledgeBase.documents.push({
          source: pdfFile,
          content: chunk,
          embedding,
        });
      }
    }
    
    knowledgeBase.totalDocuments = knowledgeBase.documents.length;

    await fs.writeFile(outputPath, JSON.stringify(knowledgeBase, null, 2));
    console.log('Base de conhecimento atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar a base de conhecimento:', error);
  }
}

updateKnowledgeBase();