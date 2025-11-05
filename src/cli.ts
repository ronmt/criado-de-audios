#!/usr/bin/env node
import { Command } from 'commander';
import { MangaImageNarrator } from './MangaImageNarrator.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

program
  .name('manga-narrator')
  .description('Narrador de imagens de mangá usando OCR e TTS open-source')
  .version('1.0.0');

program
  .command('narrate')
  .description('Narra uma ou mais imagens de mangá')
  .argument('<images...>', 'Caminho(s) para a(s) imagem(ns) do mangá')
  .option('-v, --voice <voice>', 'Voz para narração (ex: pt-BR-FranciscaNeural, ja-JP-NanamiNeural)', 'pt-BR-FranciscaNeural')
  .option('-l, --language <lang>', 'Idioma do texto (pt, en, ja)', 'ja')
  .option('-d, --detail <level>', 'Nível de detalhe (brief, normal, detailed)', 'normal')
  .option('--no-description', 'Não incluir descrição adicional')
  .option('-o, --output <dir>', 'Diretório de saída', './output')
  .action(async (images: string[], options) => {
    try {
      // Validar imagens
      const validImages: string[] = [];
      for (const imagePath of images) {
        const fullPath = resolve(imagePath);
        if (!existsSync(fullPath)) {
          console.error(`❌ Imagem não encontrada: ${imagePath}`);
          continue;
        }
        validImages.push(fullPath);
      }

      if (validImages.length === 0) {
        console.error('❌ Nenhuma imagem válida encontrada');
        process.exit(1);
      }

      // Criar instância do narrador
      const narrator = new MangaImageNarrator(options.output);

      // Processar imagens
      console.log(`\n🎬 Iniciando narração de ${validImages.length} imagem(ns)...\n`);

      const results = await narrator.narrateMultiplePages(validImages, {
        voice: options.voice,
        language: options.language,
        detailLevel: options.detail,
        includeDescription: options.description,
      });

      // Limpar recursos
      await narrator.cleanup();

      // Exibir resumo
      console.log('\n📊 Resumo:');
      console.log('═══════════════════════════════════════');
      results.forEach((result, index) => {
        console.log(`\n[Página ${index + 1}]`);
        console.log(`  📝 Texto extraído: ${result.analysis.extractedText.substring(0, 80)}...`);
        console.log(`  🎵 Áudio/Texto: ${result.audioPath}`);
        console.log(`  📊 Confiança OCR: ${result.analysis.confidence.toFixed(2)}%`);
        console.log(`  🔤 Blocos de texto: ${result.analysis.textBlocks.length}`);
      });

      console.log('\n✨ Processo concluído com sucesso!\n');
    } catch (error) {
      console.error('❌ Erro ao processar:', error);
      process.exit(1);
    }
  });

program
  .command('voices')
  .description('Lista todas as vozes disponíveis do edge-tts')
  .action(async () => {
    console.log('🎤 Listando vozes disponíveis do edge-tts...\n');
    await MangaImageNarrator.listAvailableVoices();
  });

program
  .command('test')
  .description('Testa a configuração do OCR e TTS')
  .action(async () => {
    try {
      console.log('🔍 Testando configuração...\n');

      const narrator = new MangaImageNarrator('./output');
      console.log('✅ MangaImageNarrator criado');

      console.log('🔧 Inicializando OCR...');
      await narrator.initialize('jpn');

      console.log('✅ Configuração OK!\n');

      await narrator.cleanup();
    } catch (error) {
      console.error('❌ Erro:', error);
      console.log('\n📝 Certifique-se de ter instalado:');
      console.log('  - npm install (dependências Node.js)');
      console.log('  - pip install edge-tts (para síntese de voz)');
      process.exit(1);
    }
  });

program.parse();
