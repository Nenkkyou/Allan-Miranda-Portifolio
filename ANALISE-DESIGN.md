# Design e movimento do portfólio

A identidade segue o briefing: composição editorial em preto e branco, Manrope e DM Mono, acentos da Paraty GO, títulos grandes e as três imagens originais. O movimento faz parte da apresentação e acompanha a leitura.

## Abertura

O elemento visual é uma superfície de Möbius desenhada em canvas: contornos claros, profundidade e um traço ciano atravessando a fita. A forma gira, inclina com o ponteiro e se desdobra durante a rolagem. A animação usa o ticker do GSAP, limita o desenho a 30 quadros por segundo e pausa o desenho fora da tela. A quantidade de contornos e a resolução se adaptam ao espaço disponível.

O título entra por linhas, com máscara e rotação. Ao rolar, as três linhas saem em direções diferentes. As ações para explorar os trabalhos e conversar usam tratamento tipográfico e sublinhado.

## Texto e projetos

O manifesto é preenchido palavra por palavra, do cinza escuro ao branco, conforme a rolagem. O itálico e a ordem de leitura são preservados.

Os projetos ocupam cenas de tela cheia. Cada uma tem abertura com recorte circular e aproximação da imagem, entrada escalonada do conteúdo, um intervalo para leitura e saída com ampliação, desfoque e deslocamento da palavra de fundo. As órbitas giram continuamente. A identidade da Paraty GO voltou ao formato circular.

Foram retiradas as fichas em tabelas, os sinais de mira e as legendas decorativas acrescentados aos projetos. O conteúdo voltou a ter foco em identidade, título, descrição e áreas de atuação.

O retrato tem abertura por máscara, deslocamento da imagem e entrada do nome. Sobre e contato também têm sequências de entrada ligadas ao scroll.

## Responsividade e acessibilidade

As cenas dos projetos também são animadas no celular, com imagem e conteúdo empilhados. Telas baixas usam fluxo contínuo para acomodar a leitura. A preferência por movimento reduzido mantém o conteúdo estático e visível. Sem o CDN de animações, o menu, as âncoras e o conteúdo continuam acessíveis; a escultura tem uma pose estática.

Permanecem o foco visível, o atalho para o conteúdo, o controle do menu por teclado e a indicação da seção atual.

## Verificação

A ferramenta `npm run shots` registra fases de entrada, leitura e saída dos projetos em desktop (1440 × 900), tablet (820 × 1000) e celulares (420 × 900 e 390 × 844), além das demais seções.

A inspeção das animações compara quadros do canvas em instantes diferentes, o preenchimento das palavras antes, durante e depois do scroll, as fases dos projetos e o recorte circular das imagens. O build para hospedagem é gerado com `npm run build`.
