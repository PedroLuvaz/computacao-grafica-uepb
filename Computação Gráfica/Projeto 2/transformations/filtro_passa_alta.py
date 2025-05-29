import cv2
import numpy as np
from tkinter import Label, messagebox
from PIL import Image, ImageTk

def filtro_passa_alta(imagem):
    kernel = np.array([[-1, -1, -1],
                       [-1,  8, -1],
                       [-1, -1, -1]], dtype=np.float32)
    altura, largura = imagem.shape
    kaltura, klargura = kernel.shape

    imagem_filtrada = np.zeros_like(imagem)
    offset_y = kaltura // 2
    offset_x = klargura // 2

    for y in range(offset_y, altura - offset_y):
        for x in range(offset_x, largura - offset_x):
            soma = 0.0
            for ky in range(kaltura):
                for kx in range(klargura):
                    ny = y + ky - offset_y
                    nx = x + kx - offset_x
                    soma += imagem[ny, nx] * kernel[ky, kx]
            imagem_filtrada[y, x] = min(max(soma, 0), 255)

    return imagem, imagem_filtrada.astype(np.uint8)

def on_aplicar_filtro_passa_alta(caminho_imagem, frame_imagens):
    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        if imagem is None:
            raise ValueError("Erro ao carregar a imagem.")
        
        imagem_original, imagem_filtrada = filtro_passa_alta(imagem)

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem_original))
        imagem_filtrada_tk = ImageTk.PhotoImage(Image.fromarray(imagem_filtrada))

        for widget in frame_imagens.winfo_children():
            widget.destroy()

        label_original = Label(frame_imagens, image=imagem_original_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame_imagens, image=imagem_filtrada_tk, text="Filtro Passa-Alta", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_filtrada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))
