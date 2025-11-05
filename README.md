# 📖 Manga Image Narrator

Narrador **100% gratuito e open-source** de imagens de mangá. Extrai texto usando OCR (Tesseract.js) e converte em áudio natural usando edge-tts.

**✨ Sem APIs pagas! Sem chaves de API! Totalmente gratuito!**

## 🎯 Funcionalidades

- 🔍 **OCR Gratuito**: Usa Tesseract.js para extrair texto de imagens
- 💬 **Suporte Multi-idioma**: Japonês, Português, Inglês e mais
- 🎙️ **TTS Gratuito**: Síntese de voz com edge-tts (vozes Microsoft)
- 📊 **Análise de Layout**: Detecta e ordena blocos de texto corretamente
- 🎨 **Pré-processamento**: Melhora a qualidade da imagem para melhor OCR
- 📚 **Processamento em Lote**: Processa múltiplas páginas de uma vez
- 🌍 **100% Local**: OCR roda no navegador, TTS usa ferramentas gratuitas

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- Python 3.7+ (para edge-tts)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd criado-de-audios

# Instale as dependências Node.js
npm install

# Instale o edge-tts (TTS gratuito)
pip install edge-tts
```

**Pronto! Sem necessidade de chaves de API!** 🎉

## 📖 Uso

### Via CLI (Linha de Comando)

```bash
# Narrar uma única imagem de mangá
npm run narrate -- imagem-manga.jpg

# Narrar múltiplas páginas
npm run narrate -- pagina1.jpg pagina2.jpg pagina3.jpg

# Opções avançadas
npm run narrate -- imagem.jpg \
  --voice ja-JP-NanamiNeural \
  --language ja \
  --detail detailed \
  --output ./minhas-narracoes
```

### Comandos Disponíveis

#### Narrar imagens

```bash
npm run narrate -- <imagens...> [opções]
```

**Opções:**

- `-v, --voice <voice>`: Voz para narração (padrão: `pt-BR-FranciscaNeural`)
  - Exemplos: `pt-BR-FranciscaNeural`, `ja-JP-NanamiNeural`, `en-US-AriaNeural`

- `-l, --language <lang>`: Idioma do OCR (padrão: `ja`)
  - Opções: `pt`, `en`, `ja`

- `-d, --detail <level>`: Nível de detalhe (padrão: `normal`)
  - Opções: `brief`, `normal`, `detailed`

- `--no-description`: Não incluir descrição adicional

- `-o, --output <dir>`: Diretório de saída (padrão: `./output`)

#### Listar vozes disponíveis

```bash
npm run narrate -- voices
```

Lista todas as vozes disponíveis do edge-tts por idioma e região.

#### Testar configuração

```bash
npm run narrate -- test
```

Verifica se o OCR e TTS estão funcionando corretamente.

## 📚 Exemplos

### Exemplo 1: Mangá Japonês

```bash
npm run narrate -- one-piece-page.jpg \
  --voice ja-JP-NanamiNeural \
  --language ja
```

### Exemplo 2: HQ em Português

```bash
npm run narrate -- turma-da-monica.jpg \
  --voice pt-BR-FranciscaNeural \
  --language pt \
  --detail detailed
```

### Exemplo 3: Comic em Inglês

```bash
npm run narrate -- spiderman.jpg \
  --voice en-US-AriaNeural \
  --language en
```

### Exemplo 4: Múltiplas Páginas

```bash
npm run narrate -- capitulo1/*.jpg \
  --voice ja-JP-NanamiNeural \
  --language ja
```

## 🎤 Vozes Recomendadas

### Português (Brasil)

- `pt-BR-FranciscaNeural` - Feminina (padrão)
- `pt-BR-AntonioNeural` - Masculina

### Japonês

- `ja-JP-NanamiNeural` - Feminina
- `ja-JP-KeitaNeural` - Masculina

### Inglês (EUA)

- `en-US-AriaNeural` - Feminina
- `en-US-GuyNeural` - Masculina

Para ver todas as vozes disponíveis:

```bash
npm run narrate -- voices
```

## 💻 Uso Programático (API)

```typescript
import { MangaImageNarrator } from 'manga-image-narrator';

// Criar instância do narrador
const narrator = new MangaImageNarrator('./output');

// Narrar uma única imagem
const result = await narrator.narrateManga('manga-page.jpg', {
  voice: 'ja-JP-NanamiNeural',
  language: 'ja',
  detailLevel: 'normal',
  includeDescription: true,
});

console.log('Texto extraído:', result.analysis.extractedText);
console.log('Confiança OCR:', result.analysis.confidence);
console.log('Áudio salvo em:', result.audioPath);

// Limpar recursos quando terminar
await narrator.cleanup();
```

### Apenas extração de texto (sem áudio)

```typescript
const narrator = new MangaImageNarrator('./output');
await narrator.initialize('jpn'); // Inicializar OCR

const extraction = await narrator.extractText('manga-page.jpg');

console.log('Texto:', extraction.text);
console.log('Confiança:', extraction.confidence);
console.log('Blocos:', extraction.blocks.length);

await narrator.cleanup();
```

## 📂 Estrutura de Saída

```
output/
├── imagem_narration.mp3        # Áudio da narração
├── imagem_extracted.txt        # Texto extraído (bruto)
└── temp_processed.png          # Imagem pré-processada (temporária)
```

## 🛠️ Como Funciona

1. **Pré-processamento**: A imagem é convertida para escala de cinza, normalizada e realçada usando Sharp
2. **OCR**: Tesseract.js extrai o texto da imagem com suas posições
3. **Ordenação**: Os blocos de texto são ordenados na ordem de leitura correta (direita→esquerda para mangá)
4. **Narração**: O texto é formatado e convertido em áudio usando edge-tts
5. **Saída**: Gera arquivos de áudio (.mp3) e texto (.txt)

## 🔧 Tecnologias

- **Tesseract.js**: OCR JavaScript (roda no Node.js)
- **Sharp**: Processamento de imagens
- **edge-tts**: Síntese de voz gratuita (Microsoft Edge TTS)
- **TypeScript**: Tipagem estática
- **Commander.js**: Interface de linha de comando

## 📊 Comparação com OpenAI

| Recurso | OpenAI (pago) | Este projeto (gratuito) |
|---------|---------------|------------------------|
| **Custo** | ~$0.01-0.03 por página | 💰 **100% Gratuito** |
| **API Key** | Necessária | ❌ Não necessária |
| **OCR** | GPT-4 Vision | Tesseract.js |
| **TTS** | TTS-1 | edge-tts (Microsoft) |
| **Qualidade OCR** | Alta | Boa (melhor com imagens de qualidade) |
| **Qualidade TTS** | Excelente | Muito Boa |
| **Offline** | ❌ Não | ✅ OCR local (TTS requer internet) |

## 💡 Dicas para Melhor OCR

1. **Use imagens de alta qualidade**: JPG/PNG com boa resolução
2. **Texto claro**: Imagens com bom contraste funcionam melhor
3. **Evite imagens muito comprimidas**: Artefatos de compressão prejudicam o OCR
4. **Idioma correto**: Use `-l ja` para japonês, `-l pt` para português, etc.
5. **Pré-processamento**: O sistema já faz automaticamente, mas você pode editar a função `preprocessImage()` para ajustar

## 🐛 Troubleshooting

### "edge-tts não encontrado"

```bash
# Instale o edge-tts
pip install edge-tts

# Ou com pip3
pip3 install edge-tts
```

### OCR com baixa confiança

- Verifique se a imagem tem boa qualidade
- Use o idioma correto (`--language ja/pt/en`)
- Tente pré-processar a imagem manualmente antes

### "Worker não inicializado"

Se usar programaticamente, chame `await narrator.initialize()` antes de usar.

## 🗺️ Roadmap

- [ ] Suporte para ordem de leitura LTR (comics ocidentais)
- [ ] Detecção automática de idioma
- [ ] Interface web
- [ ] Suporte para PDF
- [ ] Cache de análises
- [ ] Combinação de áudios de múltiplas páginas
- [ ] Detecção de balões de fala
- [ ] Suporte para mais idiomas (coreano, chinês, etc.)

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra issues e pull requests.

## 📄 Licença

MIT

## 💡 Casos de Uso

- **Acessibilidade**: Torne mangás acessíveis para pessoas com deficiência visual
- **Aprendizado de Idiomas**: Ouça mangás em diferentes idiomas
- **Audiobooks**: Converta suas coleções de mangá em audiobooks
- **Extração de Dados**: Extraia texto de mangás para análise ou tradução
- **Estudos**: Use para pesquisas sobre narrativa visual

## 🙏 Agradecimentos

- [Tesseract.js](https://github.com/naptha/tesseract.js) - OCR em JavaScript
- [edge-tts](https://github.com/rany2/edge-tts) - TTS gratuito usando Microsoft Edge
- [Sharp](https://github.com/lovell/sharp) - Processamento de imagens

---

**Feito com ❤️ sem gastar nada em APIs**
