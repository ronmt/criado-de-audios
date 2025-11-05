/**
 * Exemplo de uso programático do Manga Image Narrator
 */

import { MangaImageNarrator } from './src/MangaImageNarrator.js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ Por favor, configure OPENAI_API_KEY no arquivo .env');
    process.exit(1);
  }

  // Criar instância do narrador
  const narrator = new MangaImageNarrator(apiKey, './output');

  // Exemplo 1: Narrar uma única imagem
  console.log('\n=== Exemplo 1: Narração Simples ===\n');

  try {
    const result = await narrator.narrateManga('./sua-imagem.jpg', {
      voice: 'nova',
      language: 'pt',
      detailLevel: 'normal',
      includeVisualDescription: true,
    });

    console.log('\n📊 Resultado:');
    console.log('Texto da narração:', result.text.substring(0, 200) + '...');
    console.log('Áudio salvo em:', result.audioPath);
    console.log('Personagens identificados:', result.analysis.characters);
    console.log('Total de diálogos:', result.analysis.dialogues.length);
  } catch (error) {
    console.error('❌ Erro:', error);
  }

  // Exemplo 2: Narrar múltiplas páginas
  console.log('\n\n=== Exemplo 2: Múltiplas Páginas ===\n');

  try {
    const results = await narrator.narrateMultiplePages(
      [
        './pagina1.jpg',
        './pagina2.jpg',
        './pagina3.jpg',
      ],
      {
        voice: 'onyx',
        language: 'pt',
        detailLevel: 'detailed',
      }
    );

    console.log(`\n✅ ${results.length} páginas processadas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro:', error);
  }

  // Exemplo 3: Apenas análise sem áudio
  console.log('\n\n=== Exemplo 3: Apenas Análise ===\n');

  try {
    const analysis = await narrator.analyzeImage('./sua-imagem.jpg', {
      language: 'en',
      detailLevel: 'brief',
      includeVisualDescription: false, // Apenas diálogos
    });

    console.log('Análise:', analysis);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar exemplos
main();
