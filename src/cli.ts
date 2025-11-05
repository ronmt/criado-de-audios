#!/usr/bin/env node
import { Command } from 'commander';
import { config } from 'dotenv';
import { MangaImageNarrator } from './MangaImageNarrator.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config();

const program = new Command();

program
  .name('manga-narrator')
  .description('Narrador de imagens de mangá usando IA')
  .version('1.0.0');

program
  .command('narrate')
  .description('Narra uma ou mais imagens de mangá')
  .argument('<images...>', 'Caminho(s) para a(s) imagem(ns) do mangá')
  .option('-v, --voice <voice>', 'Voz para narração (alloy, echo, fable, onyx, nova, shimmer)', 'nova')
  .option('-l, --language <lang>', 'Idioma da narração (pt, en, ja)', 'pt')
  .option('-d, --detail <level>', 'Nível de detalhe (brief, normal, detailed)', 'normal')
  .option('--no-visual', 'Não incluir descrição visual, apenas diálogos')
  .option('-o, --output <dir>', 'Diretório de saída', './output')
  .action(async (images: string[], options) => {
    try {
      // Validar API key
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('❌ Erro: OPENAI_API_KEY não encontrada no arquivo .env');
        console.error('   Crie um arquivo .env com sua chave da API OpenAI');
        process.exit(1);
      }

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
      const narrator = new MangaImageNarrator(apiKey, options.output);

      // Processar imagens
      console.log(`\n🎬 Iniciando narração de ${validImages.length} imagem(ns)...\n`);

      const results = await narrator.narrateMultiplePages(validImages, {
        voice: options.voice,
        language: options.language,
        detailLevel: options.detail,
        includeVisualDescription: options.visual,
      });

      // Exibir resumo
      console.log('\n📊 Resumo:');
      console.log('═══════════════════════════════════════');
      results.forEach((result, index) => {
        console.log(`\n[Página ${index + 1}]`);
        console.log(`  📝 Texto: ${result.text.substring(0, 100)}...`);
        console.log(`  🎵 Áudio: ${result.audioPath}`);
        console.log(`  👥 Personagens: ${result.analysis.characters.join(', ') || 'N/A'}`);
        console.log(`  💬 Diálogos: ${result.analysis.dialogues.length}`);
      });

      console.log('\n✨ Processo concluído com sucesso!\n');
    } catch (error) {
      console.error('❌ Erro ao processar:', error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Testa a configuração da API')
  .action(async () => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('❌ OPENAI_API_KEY não encontrada');
        process.exit(1);
      }

      console.log('✅ API Key configurada');
      console.log('🔍 Testando conexão com OpenAI...');

      const narrator = new MangaImageNarrator(apiKey);
      console.log('✅ Configuração OK!');
    } catch (error) {
      console.error('❌ Erro:', error);
      process.exit(1);
    }
  });

program.parse();
