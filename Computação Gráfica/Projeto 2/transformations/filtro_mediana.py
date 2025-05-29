import cv2
import numpy as np
from tkinter import Label, messagebox
from PIL import Image, ImageTk

class Filtro:
    @staticmethod
    def adiciona_zeros(matriz_imagem):
        altura, largura = matriz_imagem.shape
        nova_imagem = np.zeros((altura + 2, largura + 2), dtype=matriz_imagem.dtype)
        nova_imagem[1:-1, 1:-1] = matriz_imagem
        return nova_imagem

class Mediana:
    def __init__(self, matriz_imagem):
        self.matriz_imagem = matriz_imagem
        self.filtro = Filtro()
        self.matriz_imagem = self.filtro.adiciona_zeros(matriz_imagem)

    def aplica_filtro(self):
        altura, largura = self.matriz_imagem.shape
        retorno = np.zeros((altura - 2, largura - 2), dtype=self.matriz_imagem.dtype)

        for i in range(1, altura - 1):
            for j in range(1, largura - 1):
                vetor = [
                    self.matriz_imagem[i - 1][j - 1], self.matriz_imagem[i - 1][j], self.matriz_imagem[i - 1][j + 1],
                    self.matriz_imagem[i][j - 1], self.matriz_imagem[i][j], self.matriz_imagem[i][j + 1],
                    self.matriz_imagem[i + 1][j - 1], self.matriz_imagem[i + 1][j], self.matriz_imagem[i + 1][j + 1]
                ]
                vetor.sort()
                retorno[i - 1][j - 1] = vetor[4]

        return retorno

def on_aplicar_filtro_mediana(caminho_imagem, frame_imagens):
    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        if imagem is None:
            raise ValueError("Erro ao carregar a imagem.")
        
        mediana = Mediana(imagem)
        imagem_filtrada = mediana.aplica_filtro()

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem))
        imagem_filtrada_tk = ImageTk.PhotoImage(Image.fromarray(imagem_filtrada))

        for widget in frame_imagens.winfo_children():
            widget.destroy()

        label_original = Label(frame_imagens, image=imagem_original_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame_imagens, image=imagem_filtrada_tk, text="Filtro de Mediana (3x3)", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_filtrada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))
