# CG·UEPB — Computação Gráfica e Processamento de Imagens

Laboratório interativo com os algoritmos fundamentais de **Computação Gráfica** e
**Processamento Digital de Imagens**, implementados do zero em HTML, CSS e JavaScript.

> UEPB · 2025.1 · Prof. Robson Pequeno de Sousa
> Pedro Lucas Vaz Andrade · Erick Nathan Almeida do Nascimento

---

## Como executar

Não há etapa de build. Como as páginas do Projeto 2 carregam imagens com `fetch`,
sirva a pasta por HTTP (abrir o arquivo direto com `file://` bloqueia essas requisições):

```bash
python -m http.server 5500
```

Depois acesse <http://localhost:5500>, ou use a versão publicada em
<https://pedroluvaz.github.io/computacao-grafica-uepb/>. A extensão **Live Server** do VS Code também funciona,
e o site pode ser publicado como está no **GitHub Pages** (os caminhos são todos relativos).

---

## Estrutura

```
.
├── index.html                  # Página inicial (escolha do projeto)
├── shared/                     # Recursos compartilhados por todas as páginas
│   ├── css/app.css             # Design system: tokens, temas claro/escuro, componentes e layouts
│   ├── js/site.js              # Manifesto de módulos, navegação, tema, toasts e animação do hero
│   └── img/favicon.svg
├── cg/                         # Projeto 1 — Computação Gráfica
│   ├── index.html
│   ├── coordenadas/            # Mundo ↔ NDC ↔ NDC centralizado ↔ dispositivo
│   ├── retas/                  # DDA e Ponto Médio (Bresenham)
│   ├── circunferencias/        # Equação explícita, trigonométrico e Ponto Médio
│   ├── transformacoes-2d/      # Matrizes 3×3, imagem PGM e viewport (exemplos/ tem PGMs de teste)
│   ├── transformacoes-3d/      # Matrizes 4×4, projeção isométrica e viewport 3D
│   ├── batimentos/             # Simulação de ECG
│   └── recorte/                # Cohen-Sutherland
└── pi/                         # Projeto 2 — Processamento de Imagens
    ├── index.html
    ├── core/pgm.js             # Leitura/escrita PGM e PBM, convolução, normalização
    ├── imagens/                # Imagens de exemplo (.pgm / .pbm)
    ├── ferramentas/            # Conversor de imagens para PGM (Python + Pillow)
    ├── filtros/
    ├── combinacao/
    ├── transformacoes/         # Transformações de intensidade
    ├── histograma/
    ├── morfologia/
    └── morfismo/
```

Cada módulo fica em sua própria pasta com `index.html`, o script `<modulo>.js` e, quando
precisa de estilos próprios, `<modulo>.css`.

### Adicionando um módulo

1. Crie `cg/<id>/index.html` (ou `pi/<id>/`) usando um módulo existente como modelo.
2. Marque o `<body>` com `data-project="cg|pi"` e `data-module="<id>"`.
3. Registre o módulo no manifesto `SITE.projects` em `shared/js/site.js`.

A barra de navegação, os breadcrumbs, o título da página e os cards das páginas iniciais
são gerados a partir desse manifesto, então nada mais precisa ser editado.

---

## Projeto 1 — Computação Gráfica

| Módulo | O que mostra |
| --- | --- |
| **Sistemas de Coordenadas** | Conversão entre coordenadas de mundo, NDC, NDC centralizado e dispositivo, em tempo real. |
| **Retas** | DDA e Ponto Médio nos 8 oitantes, com a lista de pixels gerados. |
| **Circunferências** | Equação explícita, método trigonométrico e Ponto Médio com simetria de oito vias. |
| **Transformações 2D** | Translação, escala, rotação, reflexão, cisalhamento e sequências compostas, em um quadrado ou em uma imagem PGM, com recorte pela viewport. |
| **Transformações 3D** | Matrizes homogêneas 4×4, projeção isométrica, câmera orbital e viewport 3D. |
| **Batimentos Cardíacos** | ECG com ondas P-QRS-T em modos repouso, corrida, estresse e sono, e estimativa de BPM. |
| **Recorte** | Cohen-Sutherland com códigos de região e o passo a passo de cada segmento. |

## Projeto 2 — Processamento de Imagens

| Módulo | O que mostra |
| --- | --- |
| **Filtros** | Média, mediana, passa-alta, Roberts, Roberts cruzado, Prewitt, Sobel e alto reforço, com o kernel 3×3 e a tabela de pixels. |
| **Combinação** | Soma, subtração, multiplicação, divisão, OR, AND e XOR entre duas imagens. |
| **Intensidade** | Negativo, gama, logarítmica, sigmoide, faixa dinâmica e transferência linear. |
| **Histograma** | Histograma de intensidades e equalização pela distribuição acumulada. |
| **Morfologia** | Erosão, dilatação, abertura, fechamento, contornos, gradiente, top-hat e bottom-hat, com elemento estruturante editável. |
| **Morfismo Temporal** | Interpolação linear (cross-dissolve) entre duas imagens em 60 quadros. |

---

## Tecnologias

- **HTML5, CSS3 e JavaScript** sem frameworks; os pixels são acesos manualmente.
- **[p5.js](https://p5js.org/)** (via CDN) apenas como framebuffer no Projeto 2.
- Fontes **Inter**, **Space Grotesk** e **JetBrains Mono** (Google Fonts).
