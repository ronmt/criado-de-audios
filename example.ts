/**
 * Exemplo de uso programático do Manga Image Narrator
 * Usando OCR e TTS open-source (sem APIs pagas)
 */

import { MangaImageNarrator } from './src/MangaImageNarrator.js';

async function main() {
  // Criar instância do narrador
  const narrator = new MangaImageNarrator('./output');

  // Exemplo 1: Narrar uma única imagem de mangá japonês
  console.log('\n=== Exemplo 1: Narração de Mangá Japonês ===\n');

  try {
    const result = await narrator.narrateManga('./sua-imagem.jpg', {
      voice: 'ja-JP-NanamiNeural', // Voz japonesa
      language: 'ja', // OCR para japonês
      detailLevel: 'normal',
      includeDescription: true,
    });

    console.log('\n📊 Resultado:');
    console.log('Texto extraído:', result.analysis.extractedText.substring(0, 200) + '...');
    console.log('Confiança do OCR:', result.analysis.confidence.toFixed(2) + '%');
    console.log('Áudio/Texto salvo em:', result.audioPath);
    console.log('Blocos de texto encontrados:', result.analysis.textBlocks.length);
  } catch (error) {
    console.error('❌ Erro:', error);
  }

  // Exemplo 2: Narrar múltiplas páginas em português
  console.log('\n\n=== Exemplo 2: Múltiplas Páginas (Português) ===\n');

  try {
    const results = await narrator.narrateMultiplePages(
      [
        './pagina1.jpg',
        './pagina2.jpg',
        './pagina3.jpg',
      ],
      {
        voice: 'pt-BR-FranciscaNeural', // Voz portuguesa brasileira
        language: 'pt', // OCR para português
        detailLevel: 'detailed',
      }
    );

    console.log(`\n✅ ${results.length} páginas processadas com sucesso!`);

    // Exibir estatísticas
    const avgConfidence = results.reduce((acc, r) => acc + r.analysis.confidence, 0) / results.length;
    console.log(`📊 Confiança média do OCR: ${avgConfidence.toFixed(2)}%`);
  } catch (error) {
    console.error('❌ Erro:', error);
  }

  // Exemplo 3: Apenas extração de texto (sem áudio)
  console.log('\n\n=== Exemplo 3: Apenas Extração de Texto ===\n');

  try {
    // Inicializar OCR para inglês
    await narrator.initialize('eng');

    const extraction = await narrator.extractText('./comic-page.jpg');

    console.log('📝 Texto extraído:');
    console.log(extraction.text);
    console.log(`\n📊 Confiança: ${extraction.confidence.toFixed(2)}%`);
    console.log(`🔤 Palavras encontradas: ${extraction.blocks.length}`);

    // Mostrar primeiras palavras com suas posições
    console.log('\n📍 Primeiras palavras e suas posições:');
    extraction.blocks.slice(0, 5).forEach((block, i) => {
      console.log(`  ${i + 1}. "${block.text}" em (${block.bbox.x0}, ${block.bbox.y0})`);
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  }

  // Exemplo 4: Listar vozes disponíveis
  console.log('\n\n=== Exemplo 4: Vozes Disponíveis ===\n');

  await MangaImageNarrator.listAvailableVoices();

  // Limpar recursos
  await narrator.cleanup();
  console.log('\n✅ Exemplos concluídos!');
}

// Executar exemplos
main().catch(console.error);
