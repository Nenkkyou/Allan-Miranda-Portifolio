# AGENTS.md — Portfólio de Allan Miranda

## Visão geral do projeto

Site de portfólio pessoal de **Allan Miranda** (engenharia de IA e desenvolvimento de sistemas autônomos). É uma **página única estática** (single-page), em **português brasileiro (pt-BR)**, com estética editorial sóbria em preto e branco e pontos de cor (ciano `#13a9c8`, azul `#1354a3`, laranja `#e56a30`) que dialogam com a marca do projeto Paraty GO.

A página apresenta dois projetos: **P-Box** (agente de IA autônomo rodando em Raspberry Pi) e **Paraty GO** (plataforma digital de turismo/cultura da cidade de Paraty).

O arquivo `prompt-inicial.txt` é o briefing original de design/conteúdo do site — consulte-o para entender a intenção (paleta, tom de voz, imagens disponíveis) antes de mudanças visuais ou de texto.

## Estrutura do repositório

```
├── index.html          # Página única: todo o conteúdo e marcação semântica
├── style.css           # Todos os estilos (CSS puro, sem pré-processador)
├── script.js           # Todas as animações e interações (JS vanilla + GSAP)
├── server.js           # Servidor estático zero-dependência (npm run dev)
├── package.json        # Scripts npm (dev, shots); única devDependency: puppeteer-core
├── tools/
│   ├── build.mjs           # Gera dist/ com .htaccess para deploy (npm run build)
│   └── shots.mjs           # Captura screenshots desktop/mobile para QA visual
├── imagens/
│   ├── pbox-logo.jpg       # Logo do P-Box
│   ├── paratygo-logo.jpg   # Logo da Paraty GO
│   └── retrato-pb.jpg      # Retrato P&B de Allan
├── prompt-inicial.txt  # Briefing original do design (contexto, não código)
└── AGENTS.md           # Este arquivo
```

## Stack técnica

- **HTML5 + CSS3 + JavaScript puro (vanilla)**. Não há framework, bundler, transpilador ou `package.json`.
- **GSAP 3.12.5 + ScrollTrigger**, carregados via CDN (`cdn.jsdelivr.net`) no final do `index.html`, **antes** de `script.js`.
- **Fontes Google Fonts**: `Manrope` (texto) e `DM Mono` (detalhes técnicos/numéricos), carregadas via `<link>` no `<head>`.
- Não há backend, banco de dados, variáveis de ambiente nem segredos.

## Build, execução e deploy

- **Não há processo de build.** Os arquivos são servidos exatamente como estão.
- Para rodar localmente: `npm run dev` (sobe `server.js`, servidor estático zero-dependência em Node, em <http://localhost:3000>; se a porta estiver ocupada, tenta a próxima automaticamente). Alternativas sem npm: abrir `index.html` no navegador, `python -m http.server 8000` ou `npx serve .`.
- `npm run build` gera `dist/` (`tools/build.mjs`): cópia de `index.html`, `style.css`, `script.js` e `imagens/` + `.htaccess` para Apache/Hostinger (força HTTPS, compressão, cache, `Options -Indexes`). Deploy: subir o **conteúdo** de `dist/` para `public_html`.
- `npm run shots` executa `tools/shots.mjs` (puppeteer-core + Chrome local) para capturar screenshots de todas as seções em desktop (1440×900) e mobile (390×844) na pasta `shots/` — útil para verificação visual após mudanças. Requer o servidor rodando.
- `node_modules/` e `shots/` estão no `.gitignore`; a única dependência de desenvolvimento é `puppeteer-core`.
- Deploy: hospedagem estática simples (qualquer serviço de static hosting serve a raiz do repositório).

## Como o código está organizado

### `index.html` (estrutura)

Página única com navegação por âncoras. Seções em ordem:

1. `#inicio` (`.hero`) — título grande animado, orbe decorativo.
2. `#manifesto` (`.manifesto`) — texto com efeito de revelação + fatos/números.
3. `#trabalhos` (`.work`) — dois `<article class="project">` com painéis *sticky* animados por scroll (P-Box e Paraty GO).
4. `#sobre` (`.about`) — retrato + texto biográfico.
5. `#contato` (`.contact`) — CTA para Telegram + rodapé.

Elementos globais fora do fluxo: `.loader` (tela de carregamento), `.grain` (textura de ruído), `.cursor` (cursor customizado) e `.nav` (navegação fixa com barra de progresso de scroll).

### `style.css` (estilos)

- CSS puro, denso (regras longas em poucas linhas). Tokens em variáveis CSS no `:root`: `--ink`, `--paper`, `--muted`, `--line`, `--cyan`, `--blue`, `--orange`, `--pad`.
- Convenção de nomenclatura **BEM-like**: `.bloco`, `.bloco__elemento`, `.bloco--modificador` (ex.: `.project__sticky`, `.project--paraty`).
- Tipografia fluida com `clamp()`; layout com grid/flex; efeito de texto revelado usa `background-clip: text` com gradiente animado.
- Breakpoints mobile: `@media (max-width: 820px)` e `(max-width: 420px)` (menu hambúrguer, cursor oculto, layouts empilhados).
- Respeita `prefers-reduced-motion` no final do arquivo.

### `script.js` (comportamento)

- JavaScript puro, estilo compacto, dependendo de `gsap` e `ScrollTrigger` globais (carregados pelo CDN). **Todo o script assume que o GSAP está disponível** — sem fallback.
- Helpers no topo: `q()` e `qa()` encapsulam `querySelector`/`querySelectorAll`.
- Responsabilidades, em ordem no arquivo: animação do loader na carga; barra de progresso e estado `is-scrolled` da nav; menu mobile (abrir/fechar, `Escape`); cursor customizado e botões "magnéticos" (apenas em `pointer:fine`); parallax do hero; revelação de texto por scroll; animações scrubbed dos painéis de projeto (clip-path, zoom, palavra de fundo, órbitas girando); revelações das seções sobre/contato.

## Convenções e diretrizes para agentes

- **Idioma**: todo o conteúdo visível, comentários e documentação são em **português brasileiro**. Novos textos no site devem seguir o tom direto e sóbrio descrito em `prompt-inicial.txt`.
- **Mudanças mínimas**: é um site pequeno e coeso; prefira ajustes pontuais a refatorações ou novas abstrações.
- **Sem novas dependências**: não há gerenciador de pacotes. Não introduza frameworks/bibliotecas sem necessidade explícita; siga o padrão CDN já usado se algo for inevitável.
- **Consistência**: mantenha a nomenclatura BEM-like no CSS, o uso das variáveis de cor existentes e o estilo compacto do JS (GSAP para toda animação).
- **Acessibilidade**: preserve atributos `aria-*` existentes, o suporte a `prefers-reduced-motion` e os textos `alt` das imagens em português.
- **Responsivo**: qualquer mudança visual deve ser verificada também nos breakpoints de 820px e 420px.
- **Imagens**: novas imagens vão na pasta `imagens/` e são referenciadas com caminho relativo (`imagens/arquivo.jpg`).

## Testes

- **Não há testes automatizados** nem configuração de lint/CI.
- Verificação é manual: abrir a página no navegador e conferir animações de scroll (GSAP/ScrollTrigger), menu mobile, cursor customizado e layout nos tamanhos de tela citados acima. O console do navegador não deve apresentar erros.
