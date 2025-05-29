import numpy as np
from PIL import Image, ImageTk
from tkinter import Label, messagebox
import tkinter as tk

def aplicar_roberts_cruzado(imagem):
    kernel1 = np.array([[1, 0], [0, -1]])
    kernel2 = np.array([[0, 1], [-1, 0]])

    imagem_array = np.array(imagem, dtype=np.float32)
    altura, largura = imagem_array.shape

    resultado = np.zeros((altura - 1, largura - 1), dtype=np.float32)

    for i in range(altura - 1):
        for j in range(largura - 1):
            recorte = imagem_array[i:i + 2, j:j + 2]
            g1 = np.sum(kernel1 * recorte)
            g2 = np.sum(kernel2 * recorte)
            resultado[i, j] = np.sqrt(g1**2 + g2**2)

    resultado = np.clip(resultado, 0, 255).astype(np.uint8)
    return resultado

def aplicar_roberts_cruzado_x(imagem):

    kernel = np.array([[1, 0], [0, -1]])

    imagem_array = np.array(imagem, dtype=np.float32)
    altura, largura = imagem_array.shape

    resultado = np.zeros((altura - 1, largura - 1), dtype=np.float32)

    for i in range(altura - 1):
        for j in range(largura - 1):
            recorte = imagem_array[i:i + 2, j:j + 2]
            g1 = np.sum(kernel * recorte)
            resultado[i, j] = np.abs(g1)

    resultado = np.clip(resultado, 0, 255).astype(np.uint8)
    return resultado


def aplicar_roberts_cruzado_y(imagem):

    kernel = np.array([[0, 1], [-1, 0]])

    imagem_array = np.array(imagem, dtype=np.float32)
    altura, largura = imagem_array.shape

    resultado = np.zeros((altura - 1, largura - 1), dtype=np.float32)

    for i in range(altura - 1):
        for j in range(largura - 1):
            recorte = imagem_array[i:i + 2, j:j + 2]
            g1 = np.sum(kernel * recorte)
            resultado[i, j] = np.abs(g1)

    resultado = np.clip(resultado, 0, 255).astype(np.uint8)
    return resultado


def on_aplicar_filtro_roberts_cruzado(caminho_imagem, frame):
    try:
        imagem = Image.open(caminho_imagem).convert("L")
        imagem_tk = ImageTk.PhotoImage(imagem)

        resultado = aplicar_roberts_cruzado(imagem)
        imagem_transformada = Image.fromarray(resultado)
        imagem_transformada_tk = ImageTk.PhotoImage(imagem_transformada)

        for widget in frame.winfo_children():
            widget.destroy()

        label_original = Label(frame, image=imagem_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame, image=imagem_transformada_tk, text="Filtro Roberts Cruzado", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_transformada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao aplicar o filtro: {e}")


def on_aplicar_filtro_roberts_cruzado_x(caminho_imagem, frame):
    try:
        imagem = Image.open(caminho_imagem).convert("L")
        imagem_tk = ImageTk.PhotoImage(imagem)

        resultado = aplicar_roberts_cruzado_x(imagem)
        imagem_transformada = Image.fromarray(resultado)
        imagem_transformada_tk = ImageTk.PhotoImage(imagem_transformada)

        for widget in frame.winfo_children():
            widget.destroy()

        label_original = Label(frame, image=imagem_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame, image=imagem_transformada_tk, text="Filtro Roberts X", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_transformada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao aplicar o filtro: {e}")


def on_aplicar_filtro_roberts_cruzado_y(caminho_imagem, frame):
    try:
        imagem = Image.open(caminho_imagem).convert("L")
        imagem_tk = ImageTk.PhotoImage(imagem)

        resultado = aplicar_roberts_cruzado_y(imagem)
        imagem_transformada = Image.fromarray(resultado)
        imagem_transformada_tk = ImageTk.PhotoImage(imagem_transformada)

        for widget in frame.winfo_children():
            widget.destroy()

        label_original = Label(frame, image=imagem_tk, text="Imagem Original", compound="top", bg="#D3D3D3")
        label_original.image = imagem_tk
        label_original.pack(side="left", padx=10)

        label_filtrada = Label(frame, image=imagem_transformada_tk, text="Filtro Roberts X", compound="top", bg="#D3D3D3")
        label_filtrada.image = imagem_transformada_tk
        label_filtrada.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao aplicar o filtro: {e}")