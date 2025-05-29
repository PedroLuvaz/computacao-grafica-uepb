import tkinter as tk
from screens.screen_filters import abrir_tela_filtro
from screens.screen_math_operations import abrir_tela_operacoes_imagem
from screens.screen_intensity_transformations import abrir_tela_transformacoes_intensidade
from screens.screen_histogram import abrir_tela_histograma

janela = tk.Tk()
janela.title("Seleção de Filtro")
janela.geometry("300x250")
janela.configure(bg="#D3D3D3")

botao_filtros_imagem = tk.Button(janela, text="Filtros de Imagem", command=lambda: abrir_tela_filtro(janela), width=30, bg="#959595")
botao_filtros_imagem.pack(pady=10)

botao_operacoes_imagem = tk.Button(janela, text="Operações com Imagem", command=lambda: abrir_tela_operacoes_imagem(janela), width=30, bg="#959595")
botao_operacoes_imagem.pack(pady=10)

botao_morfologia = tk.Button(janela, text="Operadores Morfológicos", command=lambda: abrir_tela_filtro(janela, is_morfologico=True), width=30, bg="#959595")
botao_morfologia.pack(pady=10)

botao_transformacoes_intensidade = tk.Button(janela, text="Transformações de Intensidade", command=lambda: abrir_tela_transformacoes_intensidade(janela), width=30, bg="#959595")
botao_transformacoes_intensidade.pack(pady=10)

botao_histograma = tk.Button(janela, text="Equalização de Histograma", command=lambda: abrir_tela_histograma(janela), width=30, bg="#959595")
botao_histograma.pack(pady=10)

janela.mainloop()
