import tkinter as tk
import cv2
from transformations.operacoes_grayscale import aplicar_transformacao
from PIL import Image, ImageTk

def abrir_tela_transformacoes_intensidade(janela, is_morfologico=False):
    janela_transformacoes = tk.Toplevel(janela)
    janela_transformacoes.title("Transformações de Intensidade")
    janela_transformacoes.geometry("1020x720")
    janela_transformacoes.configure(bg="#D3D3D3")

    caminho_imagens = 'images'
    imagem_selecionada = tk.StringVar(janela_transformacoes)

    if is_morfologico:
        imagem_selecionada.set("fingerprint.pbm")
        opcoes_imagens = ["fingerprint.pbm", "map.pbm", "holes.pbm"]
    else:
        imagem_selecionada.set("")
        opcoes_imagens = ["Lenag.pgm", "Airplane.pgm", "Lenasalp.pgm", "Lena.pgm"]

    imagem = None
    imagem_transformada = None

    label_original = None
    label_transformada = None

    def carregar_imagem(*args):
        nonlocal imagem, imagem_transformada, label_original, label_transformada

        if label_original:
            label_original.destroy()
        if label_transformada:
            label_transformada.destroy()
        
        nome_imagem = imagem_selecionada.get()
        caminho_imagem = f"{caminho_imagens}/{nome_imagem}"
        imagem = cv2.imread(caminho_imagem, cv2.IMREAD_GRAYSCALE)
        imagem_transformada = None
        exibir_imagens()

    imagem_selecionada.trace("w", carregar_imagem)

    def aplicar_transformacao_especifica(tipo):
        nonlocal imagem_transformada, label_original, label_transformada

        if label_original:
            label_original.destroy()
        if label_transformada:
            label_transformada.destroy()
        
        if imagem is not None:
            imagem_transformada = aplicar_transformacao(tipo, imagem)
            exibir_imagens()
        else:
            tk.messagebox.showwarning("Aviso", "Selecione uma imagem válida no menu!")

    def exibir_imagens():
        nonlocal label_original, label_transformada
        if imagem is not None:

            imagem_original_pil = Image.fromarray(imagem)
            imagem_original_tk = ImageTk.PhotoImage(imagem_original_pil)
            label_original = tk.Label(janela_transformacoes, image=imagem_original_tk, text="Imagem Original", compound="top")
            label_original.image = imagem_original_tk
            label_original.pack(side="left", padx=10)

        if imagem_transformada is not None:

            imagem_transformada_pil = Image.fromarray(imagem_transformada)
            imagem_transformada_tk = ImageTk.PhotoImage(imagem_transformada_pil)
            label_transformada = tk.Label(janela_transformacoes, image=imagem_transformada_tk, text="Imagem Transformada", compound="top")
            label_transformada.image = imagem_transformada_tk
            label_transformada.pack(side="right", padx=10)

    menu_imagens = tk.OptionMenu(janela_transformacoes, imagem_selecionada, *opcoes_imagens)
    menu_imagens.pack(pady=5)

    botoes_transformacoes = [
        ("Negativo", lambda: aplicar_transformacao_especifica("Negativo")),
        ("Transformação Gamma", lambda: aplicar_transformacao_especifica("Gamma")),
        ("Transformação Logarítmica", lambda: aplicar_transformacao_especifica("Logarítmica")),
        ("Transferência de Intensidade Geral", lambda: aplicar_transformacao_especifica("Transferência Intensidade Geral")),
        ("Faixa Dinâmica", lambda: aplicar_transformacao_especifica("Faixa Dinâmica")),
        ("Transferência Linear", lambda: aplicar_transformacao_especifica("Transferência Linear")),
    ]

    for texto, comando in botoes_transformacoes:
        botao = tk.Button(janela_transformacoes, text=texto, command=comando)
        botao.pack(pady=10)
