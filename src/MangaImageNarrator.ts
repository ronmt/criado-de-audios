import OpenAI from 'openai';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { basename } from 'path';

export interface NarrationOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  language?: 'pt' | 'en' | 'ja';
  detailLevel?: 'brief' | 'normal' | 'detailed';
  includeVisualDescription?: boolean;
}

export interface NarrationResult {
  text: string;
  audioPath: string;
  analysis: {
    dialogues: string[];
    sceneDescription: string;
    characters: string[];
  };
}

export class MangaImageNarrator {
  private openai: OpenAI;
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = './output') {
    this.openai = new OpenAI({ apiKey });
    this.outputDir = outputDir;

    // Criar diretório de saída se não existir
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Analisa uma imagem de mangá e extrai informações
   */
  async analyzeImage(
    imagePath: string,
    options: NarrationOptions = {}
  ): Promise<string> {
    const {
      language = 'pt',
      detailLevel = 'normal',
      includeVisualDescription = true,
    } = options;

    // Ler a imagem como base64
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(imagePath);

    // Criar prompt baseado nas opções
    const prompt = this.buildAnalysisPrompt(
      language,
      detailLevel,
      includeVisualDescription
    );

    console.log('🔍 Analisando imagem do mangá...');

    // Analisar imagem com GPT-4 Vision
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const analysis = response.choices[0].message.content || '';
    console.log('✅ Análise concluída!');

    return analysis;
  }

  /**
   * Converte texto em áudio usando TTS
   */
  async textToSpeech(
    text: string,
    outputFileName: string,
    voice: NarrationOptions['voice'] = 'nova'
  ): Promise<string> {
    console.log('🎙️  Gerando narração em áudio...');

    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const outputPath = `${this.outputDir}/${outputFileName}`;

    writeFileSync(outputPath, buffer);

    console.log(`✅ Áudio salvo em: ${outputPath}`);

    return outputPath;
  }

  /**
   * Processa uma imagem de mangá completa: analisa e gera narração em áudio
   */
  async narrateManga(
    imagePath: string,
    options: NarrationOptions = {}
  ): Promise<NarrationResult> {
    console.log(`\n📖 Iniciando narração de: ${basename(imagePath)}\n`);

    // Analisar a imagem
    const analysisText = await this.analyzeImage(imagePath, options);

    // Extrair informações da análise
    const analysis = this.parseAnalysis(analysisText);

    // Gerar nome do arquivo de saída
    const baseName = basename(imagePath, this.getExtension(imagePath));
    const audioFileName = `${baseName}_narration.mp3`;

    // Converter para áudio
    const audioPath = await this.textToSpeech(
      analysisText,
      audioFileName,
      options.voice
    );

    // Salvar também o texto da análise
    const textPath = `${this.outputDir}/${baseName}_analysis.txt`;
    writeFileSync(textPath, analysisText);
    console.log(`📝 Análise salva em: ${textPath}`);

    console.log('\n🎉 Narração concluída com sucesso!\n');

    return {
      text: analysisText,
      audioPath,
      analysis,
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

    for (let i = 0; i < imagePaths.length; i++) {
      console.log(`\n[${i + 1}/${imagePaths.length}] Processando página...`);
      const result = await this.narrateManga(imagePaths[i], options);
      results.push(result);
    }

    console.log(`\n✨ Todas as ${imagePaths.length} páginas foram processadas!`);

    return results;
  }

  /**
   * Constrói o prompt de análise baseado nas opções
   */
  private buildAnalysisPrompt(
    language: string,
    detailLevel: string,
    includeVisualDescription: boolean
  ): string {
    const prompts: Record<string, string> = {
      pt: `Você é um narrador profissional de mangás. Analise esta imagem de mangá e forneça uma narração ${detailLevel === 'brief' ? 'breve' : detailLevel === 'detailed' ? 'detalhada' : 'normal'}.

Instruções:
1. Leia todos os diálogos nos balões de fala na ordem correta de leitura do mangá (direita para esquerda, cima para baixo)
2. ${includeVisualDescription ? 'Descreva a cena visual: cenário, ações dos personagens, expressões faciais' : 'Foque apenas nos diálogos'}
3. Identifique os personagens se possível
4. Narre de forma fluida e natural, como se estivesse contando uma história

Formato da narração:
- Use uma linguagem natural e envolvente
- Para diálogos, indique o personagem quando possível (ex: "Naruto diz: ...")
- ${includeVisualDescription ? 'Descreva elementos visuais importantes entre os diálogos' : ''}
- Mantenha o tom e a emoção da cena

Comece a narração:`,

      en: `You are a professional manga narrator. Analyze this manga image and provide a ${detailLevel} narration.

Instructions:
1. Read all dialogue in speech bubbles in the correct manga reading order (right to left, top to bottom)
2. ${includeVisualDescription ? 'Describe the visual scene: setting, character actions, facial expressions' : 'Focus only on dialogues'}
3. Identify characters if possible
4. Narrate fluidly and naturally, as if telling a story

Narration format:
- Use natural and engaging language
- For dialogues, indicate the character when possible (e.g., "Naruto says: ...")
- ${includeVisualDescription ? 'Describe important visual elements between dialogues' : ''}
- Maintain the tone and emotion of the scene

Begin narration:`,

      ja: `あなたはプロの漫画ナレーターです。この漫画の画像を分析し、${detailLevel === 'brief' ? '簡潔な' : detailLevel === 'detailed' ? '詳細な' : '通常の'}ナレーションを提供してください。`,
    };

    return prompts[language] || prompts['pt'];
  }

  /**
   * Extrai informações estruturadas da análise
   */
  private parseAnalysis(analysisText: string): {
    dialogues: string[];
    sceneDescription: string;
    characters: string[];
  } {
    // Extrair diálogos (linhas que parecem ser falas)
    const dialogues = analysisText
      .split('\n')
      .filter(line =>
        line.includes(':') ||
        line.includes('diz') ||
        line.includes('says') ||
        line.match(/["「『]/))
      .map(line => line.trim());

    // Extrair descrições de cena (linhas descritivas)
    const sceneDescription = analysisText
      .split('\n')
      .filter(line =>
        !line.includes(':') &&
        line.length > 20 &&
        !line.match(/["「『]/))
      .join(' ')
      .trim();

    // Tentar extrair nomes de personagens
    const characters = Array.from(
      new Set(
        analysisText
          .match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b(?=\s(?:diz|says|pergunta|grita))/g) || []
      )
    );

    return {
      dialogues,
      sceneDescription,
      characters,
    };
  }

  /**
   * Obtém o tipo MIME da imagem
   */
  private getMimeType(imagePath: string): string {
    const ext = this.getExtension(imagePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Obtém a extensão do arquivo
   */
  private getExtension(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf('.'));
  }
}
