import * as pdfjs from 'pdfjs-dist';


export async function processPdf(filePath: string): Promise<string[]> {
  const doc = await pdfjs.getDocument(filePath).promise;
  const chunks: string[] = [];
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    chunks.push(...splitTextIntoChunks(text));
  }
  
  return chunks;
}

function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    i += chunkSize - overlap;
    if (i + chunkSize > text.length && i < text.length) {
      chunks.push(text.slice(i, text.length));
      break;
    }
  }
  return chunks;
}