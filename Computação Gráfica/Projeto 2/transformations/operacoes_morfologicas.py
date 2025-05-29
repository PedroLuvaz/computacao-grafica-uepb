import cv2
import numpy as np
from tkinter import Label, messagebox
from PIL import Image, ImageTk

mascara = np.ones((3, 3), dtype=np.uint8)

label_original = None
label_resultado = None

def aplicar_erosao(imagem, mascara, binario=False):
    altura, largura = imagem.shape
    imagem_erodida = np.zeros_like(imagem)
    offset = mascara.shape[0] // 2

    for y in range(offset, altura - offset):
        for x in range(offset, largura - offset):
            vizinhanca = imagem[y - offset:y + offset + 1, x - offset:x + offset + 1]
            if binario:
                imagem_erodida[y, x] = 255 if np.all(vizinhanca == 255 * mascara) else 0
            else:
                imagem_erodida[y, x] = np.min(vizinhanca)
    return imagem_erodida

def aplicar_dilatacao(imagem, mascara, binario=False):
    altura, largura = imagem.shape
    imagem_dilatada = np.zeros_like(imagem)
    offset = mascara.shape[0] // 2

    for y in range(offset, altura - offset):
        for x in range(offset, largura - offset):
            vizinhanca = imagem[y - offset:y + offset + 1, x - offset:x + offset + 1]
            if binario:
                imagem_dilatada[y, x] = 255 if np.any(vizinhanca == 255 * mascara) else 0
            else:
                imagem_dilatada[y, x] = np.max(vizinhanca)
    return imagem_dilatada

def aplicar_abertura(imagem, mascara, binario=False):
    imagem_erodida = aplicar_erosao(imagem, mascara, binario)
    imagem_abertura = aplicar_dilatacao(imagem_erodida, mascara, binario)
    return imagem_abertura

def aplicar_fechamento(imagem, mascara, binario=False):
    imagem_dilatada = aplicar_dilatacao(imagem, mascara, binario)
    imagem_fechamento = aplicar_erosao(imagem_dilatada, mascara, binario)
    return imagem_fechamento

def aplicar_gradiente(imagem, mascara, binario=False):
    imagem_dilatada = aplicar_dilatacao(imagem, mascara, binario)
    imagem_erodida = aplicar_erosao(imagem, mascara, binario)
    return imagem_dilatada - imagem_erodida

def aplicar_contorno_externo(imagem, mascara, binario=False):
    imagem_dilatada = aplicar_dilatacao(imagem, mascara, binario)
    return imagem_dilatada - imagem

def aplicar_contorno_interno(imagem, mascara, binario=False):
    imagem_erodida = aplicar_erosao(imagem, mascara, binario)
    return imagem - imagem_erodida

def aplicar_top_hat(imagem, mascara, binario=False):
    imagem_abertura = aplicar_abertura(imagem, mascara, binario)
    return imagem - imagem_abertura

def aplicar_bottom_hat(imagem, mascara, binario=False):
    imagem_fechamento = aplicar_fechamento(imagem, mascara, binario)
    return imagem_fechamento - imagem

def on_aplicar_morfologia(caminho_imagem, janela_filtro, operacao):
    global label_original, label_resultado

    try:
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        binario = caminho_imagem.endswith('.pbm')

        if operacao == "Erosão":
            imagem_resultado = aplicar_erosao(imagem, mascara, binario=binario)
            texto = "Imagem Erodida"
        elif operacao == "Dilatação":
            imagem_resultado = aplicar_dilatacao(imagem, mascara, binario=binario)
            texto = "Imagem Dilatada"
        elif operacao == "Abertura":
            imagem_resultado = aplicar_abertura(imagem, mascara, binario=binario)
            texto = "Imagem Abertura"
        elif operacao == "Fechamento":
            imagem_resultado = aplicar_fechamento(imagem, mascara, binario=binario)
            texto = "Imagem Fechamento"
        elif operacao == "Gradiente":
            imagem_resultado = aplicar_gradiente(imagem, mascara, binario=binario)
            texto = "Imagem Gradiente"
        elif operacao == "Contorno Externo":
            imagem_resultado = aplicar_contorno_externo(imagem, mascara, binario=binario)
            texto = "Imagem Contorno Externo"
        elif operacao == "Contorno Interno":
            imagem_resultado = aplicar_contorno_interno(imagem, mascara, binario=binario)
            texto = "Imagem Contorno Interno"
        elif operacao == "Top Hat":
            imagem_resultado = aplicar_top_hat(imagem, mascara, binario=binario)
            texto = "Imagem Top Hat"
        elif operacao == "Bottom Hat":
            imagem_resultado = aplicar_bottom_hat(imagem, mascara, binario=binario)
            texto = "Imagem Bottom Hat"
        else:
            raise ValueError("Operação morfológica desconhecida.")

        imagem_original_tk = ImageTk.PhotoImage(Image.fromarray(imagem))
        imagem_resultado_tk = ImageTk.PhotoImage(Image.fromarray(imagem_resultado))

        if label_original is not None:
            label_original.destroy()
        if label_resultado is not None:
            label_resultado.destroy()

        label_original = Label(janela_filtro, image=imagem_original_tk, text="Imagem Original", compound="top")
        label_original.image = imagem_original_tk
        label_original.pack(side="left", padx=10)

        label_resultado = Label(janela_filtro, image=imagem_resultado_tk, text=texto, compound="top")
        label_resultado.image = imagem_resultado_tk
        label_resultado.pack(side="right", padx=10)

    except Exception as e:
        messagebox.showerror("Erro", str(e))
