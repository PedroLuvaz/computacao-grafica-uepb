# 🚀 Projeto de Computação Gráfica e Processamento de Imagens

## 📌 Descrição Geral

Este projeto tem como objetivo a implementação de algoritmos fundamentais das áreas de **Computação Gráfica (CG)** e **Processamento Digital de Imagens (PI)** usando tecnologias web: **HTML, CSS e JavaScript**. A estrutura é dividida em dois módulos complementares:

- 🖼️ **Projeto 1 – Computação Gráfica (CG)**: Focado na manipulação de pixels, rasterização de primitivas, transformações 2D e 3D, recortes e simulações gráficas.
- 🧪 **Projeto 2 – Processamento de Imagens (PI)**: Direcionado para a análise, filtragem e transformação de imagens digitais, com suporte a imagens coloridas e binárias.

---

## 🛠 Tecnologias Utilizadas

- 🖥 **HTML5**: Estrutura da interface e elementos gráficos.
- 🎨 **CSS3**: Design visual e responsividade.
- ✨ **JavaScript**: Núcleo da lógica e algoritmos de computação gráfica e imagem.

---

## 🎯 Funcionalidades

### ✅ Projeto 1 – Computação Gráfica (CG)

#### 1️⃣ Ativação de Pixel (SetPixel)
- Controle direto de pixels em um grid para simular o acesso ao framebuffer.

#### 2️⃣ Rasterização de Primitivas

**Retas:**
- 🔹 DDA (Digital Differential Analyzer)
- 🔹 Algoritmo do Ponto Médio

**Circunferências:**
- 🟠 Equação Explícita
- 🟠 Algoritmo Trigonométrico
- 🟠 Algoritmo do Ponto Médio

#### 3️⃣ Transformações 2D

- 🔄 Rotação
- ✂️ Cisalhamento
- ➡️ Translação
- 📏 Escala
- 🔃 Reflexão
- 🖼️ **ViewPort 2D**: Mapeamento de coordenadas lógicas para coordenadas físicas.

#### 4️⃣ Transformações 3D

- 📦 Projeção Ortográfica
- 🔄 Rotação nos eixos X, Y e Z
- ✂️ Cisalhamento e Escala
- 📏 Translação
- 🖼️ **ViewPort 3D**

#### 5️⃣ Recorte de Tela (Clipping)

- ✂️ **Algoritmo de Cohen-Sutherland**: Recorte eficiente de segmentos de reta com base em regiões codificadas.

#### 6️⃣ Simulador de Batimentos Cardíacos (ECG)

- ❤️ Simulação gráfica de um eletrocardiograma com ondas P, Q, R, S, T animadas dinamicamente.
- ⏱️ Botão de batimento com histórico de picos registrado a cada 10 segundos.

---

### ✅ Projeto 2 – Processamento de Imagens (PI)

#### 🎨 Filtros

- 🔸 Média
- 🔸 Mediana
- 🔸 Gaussiano
- 🔸 Laplaciano
- 🔸 Sobel (detecção de bordas)

#### ➕ Combinação de Imagens

- Operações:
  - Soma / Subtração
  - Lógicas: AND, OR, XOR

#### 🔁 Transformações

- 📐 Geométricas:
  - Rotação, Translação, Redimensionamento, Espelhamento
- 🌗 Conversão: Tons de cinza, binarização
- 🧾 **Transformações em Imagens Binárias**:
  - Redução, expansão e movimentação de objetos binarizados

#### 📊 Histograma

- Cálculo do histograma de intensidades
- Equalização para realce de contraste

#### 🧬 Morfologia Matemática

- 🧼 Erosão
- 🔁 Dilatação
- 🔄 Abertura
- 🔃 Fechamento

#### ⏳ Morfismo Temporal

- Detecção de movimento entre quadros
- Subtração temporal
- Simulação de movimento em sequências de imagens

---

## 📸 Interface

A interface é organizada por categorias com botões para cada funcionalidade:

