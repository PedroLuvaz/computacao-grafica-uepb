import tkinter as tk
from PIL import Image, ImageTk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from transformations.operacoes_histograma import equalizar_histograma

def abrir_tela_histograma(janela):
    janela_histograma = tk.Toplevel(janela)
    janela_histograma.title("Equalização de Histograma")
    janela_histograma.geometry("1020x720")
    janela_histograma.configure(bg="#D3D3D3")
    
    caminho_imagens = 'images'

    imagem_selecionada = tk.StringVar(janela_histograma)
    opcoes_imagens = ["Lena.pgm", "Airplane.pgm"]

    menu_imagem = tk.OptionMenu(janela_histograma, imagem_selecionada, *opcoes_imagens)
    menu_imagem.grid(row=0, column=0, columnspan=2, pady=5)
    menu_imagem.place(relx=0.5, rely=0.05, anchor="center")

    resultado_label = None
    histograma_original_label = None
    histograma_equalizado_label = None
    imagem_resultado_label = None
    imagem_original_label = None

    def plotar_histograma(histograma, titulo, row, col, rx, ry):

        fig, ax = plt.subplots(figsize=(6, 3))
        ax.bar(range(256), histograma, width=1, color='black')
        ax.set_title(titulo)
        ax.set_xlabel('Nível de Cinza')
        ax.set_ylabel('Frequência')
        fig.tight_layout()

        canvas = FigureCanvasTkAgg(fig, master=janela_histograma)
        canvas.draw()
        canvas.get_tk_widget().grid(row=row, column=col, pady=10)
        canvas.get_tk_widget().place(relx=rx, rely=ry, anchor="center")

    def aplicar_equalizacao():
        nonlocal resultado_label, histograma_original_label, histograma_equalizado_label, imagem_resultado_label, imagem_original_label
        
        imagem_path = f"{caminho_imagens}/{imagem_selecionada.get()}"
        
        histograma_original, imagem_equalizada, histograma_equalizado = equalizar_histograma(imagem_path)
        
        if resultado_label:
            resultado_label.destroy()
        if histograma_original_label:
            histograma_original_label.destroy()
        if histograma_equalizado_label:
            histograma_equalizado_label.destroy()
        if imagem_resultado_label:
            imagem_resultado_label.destroy()
        if imagem_original_label:
            imagem_original_label.destroy()

        imagem_original = Image.open(imagem_path)
        imagem_original_resized = ImageTk.PhotoImage(imagem_original.resize((256, 256)))
        imagem_original_label = tk.Label(janela_histograma, image=imagem_original_resized)
        imagem_original_label.image = imagem_original_resized
        imagem_original_label.grid(row=3, column=0, padx=20, pady=10)
        imagem_original_label.place(relx=0.25, rely=0.25, anchor="center")

        histograma_original_label = tk.Label(janela_histograma)
        histograma_original_label.grid(row=2, column=0, pady=5)
        plotar_histograma(histograma_original, 'Histograma Original', 3, 0, 0.25, 0.65)

        imagem_equalizada_resized = ImageTk.PhotoImage(imagem_equalizada.resize((256, 256)))
        imagem_resultado_label = tk.Label(janela_histograma, image=imagem_equalizada_resized)
        imagem_resultado_label.image = imagem_equalizada_resized
        imagem_resultado_label.grid(row=1, column=2, padx=20, pady=10)
        imagem_resultado_label.place(relx=0.75, rely=0.25, anchor="center")

        histograma_equalizado_label = tk.Label(janela_histograma)
        histograma_equalizado_label.grid(row=2, column=2, pady=5)
        plotar_histograma(histograma_equalizado, 'Histograma Equalizado', 3, 2, 0.75, 0.65)

    botao_aplicar = tk.Button(janela_histograma, text="Aplicar Equalização", command=aplicar_equalizacao)
    botao_aplicar.grid(row=4, column=0, columnspan=2, pady=20)
    botao_aplicar.place(relx=0.5, rely=0.95, anchor="center")

