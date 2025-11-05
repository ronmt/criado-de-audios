# 📖 Manga Image Narrator

Narrador inteligente de imagens de mangá usando IA. Analisa páginas de mangá, extrai diálogos e descrições visuais, e converte tudo em narração de áudio natural.

## ✨ Funcionalidades

- 🔍 **Análise Visual com IA**: Usa GPT-4 Vision para analisar imagens de mangá
- 💬 **Extração de Diálogos**: Identifica e lê diálogos na ordem correta de leitura
- 🎨 **Descrição de Cenas**: Descreve cenários, ações e expressões dos personagens
- 🎙️ **Narração em Áudio**: Converte texto em áudio natural com múltiplas vozes
- 📚 **Processamento em Lote**: Processa múltiplas páginas de uma vez
- 🌍 **Multi-idioma**: Suporte para Português, Inglês e Japonês

## 🚀 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd criado-de-audios

# Instale as dependências
npm install

# Configure a API Key da OpenAI
cp .env.example .env
# Edite o arquivo .env e adicione sua chave da API
```

## 🔑 Configuração

1. Obtenha uma chave da API OpenAI em: https://platform.openai.com/api-keys
2. Crie um arquivo `.env` na raiz do projeto:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

## 📖 Uso

### Via CLI (Linha de Comando)

```bash
# Narrar uma única imagem
npm run narrate -- imagem-manga.jpg

# Narrar múltiplas páginas
npm run narrate -- pagina1.jpg pagina2.jpg pagina3.jpg

# Opções avançadas
npm run narrate -- imagem.jpg \
  --voice nova \
  --language pt \
  --detail detailed \
  --output ./minhas-narracoes
```

### Opções da CLI

- `-v, --voice <voice>`: Voz para narração
  - Opções: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
  - Padrão: `nova`

- `-l, --language <lang>`: Idioma da narração
  - Opções: `pt` (Português), `en` (Inglês), `ja` (Japonês)
  - Padrão: `pt`

- `-d, --detail <level>`: Nível de detalhe
  - Opções: `brief` (breve), `normal`, `detailed` (detalhado)
  - Padrão: `normal`

- `--no-visual`: Narra apenas diálogos, sem descrição visual

- `-o, --output <dir>`: Diretório de saída
  - Padrão: `./output`

### Uso Programático (API)

```typescript
import { MangaImageNarrator } from 'manga-image-narrator';

// Criar instância do narrador
const narrator = new MangaImageNarrator(
  process.env.OPENAI_API_KEY!,
  './output'
);

// Narrar uma única imagem
const result = await narrator.narrateManga('manga-page.jpg', {
  voice: 'nova',
  language: 'pt',
  detailLevel: 'detailed',
  includeVisualDescription: true,
});

console.log('Narração:', result.text);
console.log('Áudio salvo em:', result.audioPath);
console.log('Personagens:', result.analysis.characters);

// Narrar múltiplas páginas
const results = await narrator.narrateMultiplePages(
  ['page1.jpg', 'page2.jpg', 'page3.jpg'],
  { voice: 'nova', language: 'pt' }
);
```

## 📂 Estrutura de Saída

O narrador cria os seguintes arquivos no diretório de saída:

```
output/
├── imagem-manga_narration.mp3    # Áudio da narração
└── imagem-manga_analysis.txt     # Texto da análise
```

## 🎭 Vozes Disponíveis

- **alloy**: Voz neutra e balanceada
- **echo**: Voz masculina, clara e profissional
- **fable**: Voz britânica, expressiva
- **onyx**: Voz masculina profunda
- **nova**: Voz feminina (padrão, recomendada para narração)
- **shimmer**: Voz feminina suave e calorosa

## 📋 Exemplos

### Exemplo 1: Narração simples

```bash
npm run narrate -- ./exemplos/onepiece-page.jpg
```

**Saída:**
```
🔍 Analisando imagem do mangá...
✅ Análise concluída!
🎙️  Gerando narração em áudio...
✅ Áudio salvo em: ./output/onepiece-page_narration.mp3
📝 Análise salva em: ./output/onepiece-page_analysis.txt
```

### Exemplo 2: Múltiplas páginas com voz masculina

```bash
npm run narrate -- cap1/*.jpg --voice onyx --detail detailed
```

### Exemplo 3: Apenas diálogos (sem descrição visual)

```bash
npm run narrate -- manga.jpg --no-visual --language en
```

## 🧪 Testes

```bash
# Testar configuração da API
npm run narrate -- test
```

## 🏗️ Desenvolvimento

```bash
# Compilar TypeScript
npm run build

# Executar em modo desenvolvimento
npm run dev

# Executar CLI em desenvolvimento
npm run narrate -- sua-imagem.jpg
```

## 🛠️ Tecnologias

- **OpenAI GPT-4 Vision**: Análise visual de imagens
- **OpenAI TTS**: Síntese de voz natural
- **TypeScript**: Tipagem estática
- **Commander.js**: Interface de linha de comando

## 📝 Requisitos

- Node.js 18+
- Chave da API OpenAI
- Imagens nos formatos: JPG, PNG, WebP, GIF

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

MIT

## 🎯 Roadmap

- [ ] Suporte para PDF (múltiplas páginas)
- [ ] Detecção automática de ordem de leitura (mangá vs comic ocidental)
- [ ] Cache de análises para evitar reprocessamento
- [ ] Interface web
- [ ] Suporte para mais idiomas
- [ ] Reconhecimento de personagens recorrentes
- [ ] Efeitos sonoros automáticos
- [ ] Música de fundo contextual

## 💡 Casos de Uso

- **Acessibilidade**: Torne mangás acessíveis para pessoas com deficiência visual
- **Aprendizado de Idiomas**: Ouça mangás em diferentes idiomas
- **Audiobooks**: Converta suas coleções de mangá em audiobooks
- **Análise de Conteúdo**: Extraia e analise diálogos e cenas automaticamente

---

Feito com ❤️ usando IA
