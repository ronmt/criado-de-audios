import { createWorker, Worker } from 'tesseract.js';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { basename } from 'path';

const execAsync = promisify(exec);

export interface NarrationOptions {
  voice?: string; // Vozes do edge-tts (ex: 'pt-BR-FranciscaNeural', 'ja-JP-NanamiNeural')
  language?: 'pt' | 'en' | 'ja';
  detailLevel?: 'brief' | 'normal' | 'detailed';
  includeDescription?: boolean;
  readingOrder?: 'rtl' | 'ltr'; // right-to-left (mangá) ou left-to-right (comics)
}

export interface NarrationResult {
  text: string;
  audioPath: string;
  analysis: {
    extractedText: string;
    textBlocks: TextBlock[];
    confidence: number;
  };
}

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export class MangaImageNarrator {
  private worker: Worker | null = null;
  private outputDir: string;
  private edgeTtsAvailable: boolean = false;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;

    // Criar diretório de saída se não existir
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Inicializa o worker do Tesseract
   */
  async initialize(language: string = 'jpn'): Promise<void> {
    console.log('🔧 Inicializando OCR...');

    this.worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\r⏳ Reconhecendo texto: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Verificar se edge-tts está disponível
    try {
      await execAsync('which edge-tts');
      this.edgeTtsAvailable = true;
      console.log('\n✅ OCR inicializado com sucesso!');
    } catch {
      console.log('\n⚠️  edge-tts não encontrado. Instale com: pip install edge-tts');
      this.edgeTtsAvailable = false;
    }
  }

  /**
   * Extrai texto de uma imagem usando Tesseract OCR
   */
  async extractText(imagePath: string): Promise<{
    text: string;
    blocks: TextBlock[];
    confidence: number;
  }> {
    if (!this.worker) {
      throw new Error('Worker não inicializado. Chame initialize() primeiro.');
    }

    console.log('\n🔍 Extraindo texto da imagem...');

    // Processar imagem com Sharp para melhorar qualidade do OCR
    const processedImagePath = await this.preprocessImage(imagePath);

    // Reconhecer texto
    const { data } = await this.worker.recognize(processedImagePath);

    console.log(`\n✅ Texto extraído! (Confiança: ${data.confidence.toFixed(2)}%)`);

    // Extrair blocos de texto com posições
    const blocks: TextBlock[] = data.words.map((word) => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox,
    }));

    // Ordenar blocos de acordo com a ordem de leitura
    const sortedBlocks = this.sortTextBlocks(blocks);

    // Combinar texto dos blocos
    const fullText = sortedBlocks.map((b) => b.text).join(' ');

    return {
      text: fullText,
      blocks: sortedBlocks,
      confidence: data.confidence,
    };
  }

  /**
   * Pré-processa a imagem para melhorar o OCR
   */
  private async preprocessImage(imagePath: string): Promise<string> {
    const outputPath = `${this.outputDir}/temp_processed.png`;

    await sharp(imagePath)
      .greyscale() // Converter para escala de cinza
      .normalize() // Normalizar contraste
      .sharpen() // Aumentar nitidez
      .toFile(outputPath);

    return outputPath;
  }

  /**
   * Ordena blocos de texto de acordo com a ordem de leitura
   */
  private sortTextBlocks(blocks: TextBlock[]): TextBlock[] {
    // Ordenar por posição (cima para baixo, direita para esquerda para mangá)
    return blocks.sort((a, b) => {
      // Primeiro ordena por linha (y)
      const lineThreshold = 20; // pixels de tolerância para considerar mesma linha
      if (Math.abs(a.bbox.y0 - b.bbox.y0) > lineThreshold) {
        return a.bbox.y0 - b.bbox.y0;
      }
      // Na mesma linha, ordena da direita para esquerda (mangá japonês)
      return b.bbox.x0 - a.bbox.x0;
    });
  }

  /**
   * Gera narração em texto baseado no texto extraído
   */
  private generateNarration(
    extractedText: string,
    options: NarrationOptions
  ): string {
    const { detailLevel = 'normal', includeDescription = true } = options;

    let narration = '';

    if (includeDescription) {
      if (detailLevel === 'detailed') {
        narration += 'Esta é uma página de mangá. ';
      }
      narration += 'O texto encontrado na página é:\n\n';
    }

    // Limpar e formatar o texto
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .trim();

    narration += cleanedText;

    if (detailLevel === 'detailed' && includeDescription) {
      narration += '\n\nFim da página.';
    }

    return narration;
  }

  /**
   * Converte texto em áudio usando edge-tts
   */
  async textToSpeech(
    text: string,
    outputFileName: string,
    voice?: string
  ): Promise<string> {
    if (!this.edgeTtsAvailable) {
      console.log('⚠️  TTS não disponível. Apenas salvando texto.');
      const textPath = `${this.outputDir}/${outputFileName.replace('.mp3', '.txt')}`;
      writeFileSync(textPath, text);
      return textPath;
    }

    console.log('\n🎙️  Gerando narração em áudio...');

    const outputPath = `${this.outputDir}/${outputFileName}`;
    const defaultVoice = voice || 'pt-BR-FranciscaNeural';

    try {
      // Criar arquivo temporário com o texto
      const tempTextFile = `${this.outputDir}/temp_text.txt`;
      writeFileSync(tempTextFile, text);

      // Usar edge-tts para gerar áudio
      await execAsync(
        `edge-tts --voice "${defaultVoice}" --file "${tempTextFile}" --write-media "${outputPath}"`
      );

      console.log(`✅ Áudio salvo em: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('❌ Erro ao gerar áudio:', error);
      // Salvar como texto se falhar
      const textPath = outputPath.replace('.mp3', '.txt');
      writeFileSync(textPath, text);
      console.log(`📝 Texto salvo em: ${textPath}`);
      return textPath;
    }
  }

  /**
   * Processa uma imagem de mangá completa: extrai texto e gera narração em áudio
   */
  async narrateManga(
    imagePath: string,
    options: NarrationOptions = {}
  ): Promise<NarrationResult> {
    console.log(`\n📖 Iniciando narração de: ${basename(imagePath)}`);

    // Inicializar se necessário
    if (!this.worker) {
      const ocrLang = this.getOCRLanguage(options.language);
      await this.initialize(ocrLang);
    }

    // Extrair texto da imagem
    const extraction = await this.extractText(imagePath);

    // Gerar narração
    const narrationText = this.generateNarration(extraction.text, options);

    // Gerar nome do arquivo de saída
    const baseName = basename(imagePath, this.getExtension(imagePath));
    const audioFileName = `${baseName}_narration.mp3`;

    // Converter para áudio
    const audioPath = await this.textToSpeech(
      narrationText,
      audioFileName,
      options.voice
    );

    // Salvar também o texto extraído
    const extractedTextPath = `${this.outputDir}/${baseName}_extracted.txt`;
    writeFileSync(extractedTextPath, extraction.text);
    console.log(`📝 Texto extraído salvo em: ${extractedTextPath}`);

    console.log('\n🎉 Narração concluída com sucesso!\n');

    return {
      text: narrationText,
      audioPath,
      analysis: {
        extractedText: extraction.text,
        textBlocks: extraction.blocks,
        confidence: extraction.confidence,
      },
    };
  }

  /**
   * Processa múltiplas imagens (páginas de mangá)
   */
  async narrateMultiplePages(
    imagePaths: string[],
    options: NarrationOptions = {}
  ): Promise<NarrationResult[]> {
    const results: NarrationResult[] = [];

    // Inicializar uma vez
    if (!this.worker) {
      const ocrLang = this.getOCRLanguage(options.language);
      await this.initialize(ocrLang);
    }

    for (let i = 0; i < imagePaths.length; i++) {
      console.log(`\n[${i + 1}/${imagePaths.length}] Processando página...`);
      const result = await this.narrateManga(imagePaths[i], options);
      results.push(result);
    }

    console.log(`\n✨ Todas as ${imagePaths.length} páginas foram processadas!`);

    return results;
  }

  /**
   * Mapeia idioma para código do Tesseract
   */
  private getOCRLanguage(language?: string): string {
    const langMap: Record<string, string> = {
      pt: 'por',
      en: 'eng',
      ja: 'jpn',
    };
    return langMap[language || 'ja'] || 'jpn';
  }

  /**
   * Obtém a extensão do arquivo
   */
  private getExtension(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf('.'));
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      console.log('🧹 Recursos liberados');
    }
  }

  /**
   * Lista vozes disponíveis do edge-tts
   */
  static async listAvailableVoices(): Promise<void> {
    try {
      const { stdout } = await execAsync('edge-tts --list-voices');
      console.log('🎤 Vozes disponíveis:\n');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Erro ao listar vozes. Certifique-se que edge-tts está instalado.');
      console.log('Instale com: pip install edge-tts');
    }
  }
}
