import cv2
import numpy as np
from tkinter import Label, messagebox
from PIL import Image, ImageTk

def filtro_roberts(imagem):
    kernel_x = np.array([[1, 0],[-1, 0]], dtype=np.float32)
    kernel_y = np.array([[1, -1],[0, 0]], dtype=np.float32)
    altura, largura = imagem.shape

    imagem_filtrada = np.zeros_like(imagem, dtype=np.float32)

    for y in range(altura - 1):
        for x in range(largura - 1):
            gx = imagem[y, x] * kernel_x[0, 0] + imagem[y, x + 1] * kernel_x[0, 1] + \
                 imagem[y + 1, x] * kernel_x[1, 0] + imagem[y + 1, x + 1] * kernel_x[1, 1]
            gy = imagem[y, x] * kernel_y[0, 0] + imagem[y, x + 1] * kernel_y[0, 1] + \
                 imagem[y + 1, x] * kernel_y[1, 0] + imagem[y + 1, x + 1] * kernel_y[1, 1]

            imagem_filtrada[y, x] = np.sqrt(gx**2 + gy**2)

    imagem_filtrada = np.clip(imagem_filtrada, 0, 255).astype(np.uint8)

    return imagem, imagem_filtrada

def on_aplicar_filtro_roberts(caminho_imagem, frame_imagens):
    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        if imagem is None:
            raise ValueError("Erro ao carregar a imagem.")
        
        imagem_original, imagem_filtrada = filtro_roberts(imagem)

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem_original))
        imagem_filtrada_tk = ImageTk.PhotoImage(Image.fromarray(imagem_filtrada))

        for widget in frame_imagens.winfo_children():
            widget.destroy()

        label_original = Label(frame_imagens, image=imagem_original_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame_imagens, image=imagem_filtrada_tk, text="Filtro Roberts", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_filtrada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))

def filtro_roberts_x(imagem):

    kernel_x = np.array([[1, 0], [-1, 0]], dtype=np.float32)

    altura, largura = imagem.shape

    imagem_filtrada = np.zeros_like(imagem, dtype=np.float32)

    for y in range(altura - 1):
        for x in range(largura - 1):

            gx = imagem[y, x] * kernel_x[0, 0] + imagem[y, x + 1] * kernel_x[0, 1] + \
                 imagem[y + 1, x] * kernel_x[1, 0] + imagem[y + 1, x + 1] * kernel_x[1, 1]
            
            imagem_filtrada[y, x] = np.abs(gx)

    imagem_filtrada = np.clip(imagem_filtrada, 0, 255).astype(np.uint8)

    return imagem, imagem_filtrada

def on_aplicar_filtro_roberts_x(caminho_imagem, frame_imagens):
    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        if imagem is None:
            raise ValueError("Erro ao carregar a imagem.")
        
        imagem_original, imagem_filtrada = filtro_roberts_x(imagem)

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem_original))
        imagem_filtrada_tk = ImageTk.PhotoImage(Image.fromarray(imagem_filtrada))

        for widget in frame_imagens.winfo_children():
            widget.destroy()

        label_original = Label(frame_imagens, image=imagem_original_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame_imagens, image=imagem_filtrada_tk, text="Filtro Roberts X", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_filtrada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))


def filtro_roberts_y(imagem):

    kernel_y = np.array([[1, -1], [0, 0]], dtype=np.float32)

    altura, largura = imagem.shape

    imagem_filtrada = np.zeros_like(imagem, dtype=np.float32)

    for y in range(altura - 1):
        for x in range(largura - 1):
            gy = imagem[y, x] * kernel_y[0, 0] + imagem[y, x + 1] * kernel_y[0, 1] + \
                 imagem[y + 1, x] * kernel_y[1, 0] + imagem[y + 1, x + 1] * kernel_y[1, 1]
            
            imagem_filtrada[y, x] = np.abs(gy)

    imagem_filtrada = np.clip(imagem_filtrada, 0, 255).astype(np.uint8)

    return imagem, imagem_filtrada

def on_aplicar_filtro_roberts_y(caminho_imagem, frame_imagens):
    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        if imagem is None:
            raise ValueError("Erro ao carregar a imagem.")
        
        imagem_original, imagem_filtrada = filtro_roberts_y(imagem)

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem_original))
        imagem_filtrada_tk = ImageTk.PhotoImage(Image.fromarray(imagem_filtrada))

        for widget in frame_imagens.winfo_children():
            widget.destroy()

        label_original = Label(frame_imagens, image=imagem_original_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame_imagens, image=imagem_filtrada_tk, text="Filtro Roberts Y", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_filtrada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))
