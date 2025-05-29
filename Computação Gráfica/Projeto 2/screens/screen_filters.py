import tkinter as tk
import numpy as np
from transformations.filtro_media import on_aplicar_filtro_media
from transformations.filtro_mediana import on_aplicar_filtro_mediana
from transformations.filtro_passa_alta import on_aplicar_filtro_passa_alta
from transformations.filtro_roberts import on_aplicar_filtro_roberts, on_aplicar_filtro_roberts_x, on_aplicar_filtro_roberts_y
from transformations.filtro_roberts_cruzado import on_aplicar_filtro_roberts_cruzado, on_aplicar_filtro_roberts_cruzado_x, on_aplicar_filtro_roberts_cruzado_y 
from transformations.filtro_prewitt import on_aplicar_filtro_prewitt, on_aplicar_filtro_prewitt_x, on_aplicar_filtro_prewitt_y
from transformations.filtro_alto_reforco import on_aplicar_alto_reforco
from transformations.filtro_sobel import on_aplicar_filtro_sobel, on_aplicar_filtro_sobel_x, on_aplicar_filtro_sobel_y
from transformations.filtro_personalizado import on_aplicar_filtro_personalizado
from transformations.operacoes_morfologicas import on_aplicar_morfologia
from utils.formatar_matriz import formatar_matriz

def abrir_tela_filtro(janela, is_morfologico=False):
    janela_filtro = tk.Toplevel(janela)
    janela_filtro.title("Aplicar Filtro")
    janela_filtro.geometry("1020x720")
    janela_filtro.configure(bg="#D3D3D3")

    caminho_imagens = 'images'
    imagem_selecionada = tk.StringVar(janela_filtro)

    if is_morfologico:
        imagem_selecionada.set("fingerprint.pbm")
        opcoes_imagens = ["fingerprint.pbm", "map.pbm", "holes.pbm", "Lenag.pgm", "Airplane.pgm", "Lenasalp.pgm", "Lena.pgm", "Lena.pbm", "Airplane.pbm"]
    else:
        imagem_selecionada.set("Lena.pgm")
        opcoes_imagens = ["Lenag.pgm", "Airplane.pgm", "Lenasalp.pgm", "Lena.pgm"]

    menu_imagens = tk.OptionMenu(janela_filtro, imagem_selecionada, *opcoes_imagens)
    menu_imagens.pack(pady=5)

    if is_morfologico:
        operacao_morfologica = tk.StringVar(janela_filtro)
        operacao_morfologica.set("Erosão")

        opcoes_operacoes = [
            "Erosão", "Dilatação", "Abertura", "Fechamento",
            "Gradiente", "Contorno Externo", "Contorno Interno",
            "Top Hat", "Bottom Hat"
        ]
        menu_operacoes = tk.OptionMenu(janela_filtro, operacao_morfologica, *opcoes_operacoes)
        menu_operacoes.pack(pady=5)

    frame_imagens = tk.Frame(janela_filtro)
    frame_imagens.pack(pady=10, expand=True)
    frame_imagens.configure(bg="#D3D3D3")

    filtro_var = tk.StringVar(janela_filtro)
    filtro_var.set("Média")

    if not is_morfologico:
        opcoes_filtros = [
            "Personalizável",
            "Média",
            "Mediana",
            "Passa Alta",
            "Roberts",
            "Roberts em X",
            "Roberts em Y",
            "Roberts Cruzado",
            "Roberts Cruzado em X",
            "Roberts Cruzado em Y",
            "Prewitt",
            "Prewitt em X",
            "Prewitt em Y",
            "Sobel",
            "Sobel em X",
            "Sobel em Y",
            "Alto Reforço"
        ]
        menu_filtros = tk.OptionMenu(janela_filtro, filtro_var, *opcoes_filtros)
        menu_filtros.pack(pady=5)

    label_k = tk.Label(janela_filtro, text="Fator K:")
    entry_k = tk.Entry(janela_filtro)
    label_k.pack_forget()
    entry_k.pack_forget()
    matriz_entries = []
    frame_matriz = tk.Frame(janela_filtro)
    frame_matriz_aplicada = tk.Frame(janela_filtro)
    frame_matriz_aplicada.pack(pady=10)

    for i in range(3):
        linha = []
        for j in range(3):
            entry = tk.Entry(frame_matriz, width=5)
            entry.grid(row=i, column=j, padx=5, pady=5)
            linha.append(entry)
        matriz_entries.append(linha)


    def aplicar_filtro():
        caminho_imagem = f"{caminho_imagens}/{imagem_selecionada.get()}"
        matriz_aplicada = None
        matriz_aplicada_dupla = None

        for widget in frame_matriz_aplicada.winfo_children():
            widget.destroy()

        if is_morfologico:
            operacao = operacao_morfologica.get()
            on_aplicar_morfologia(caminho_imagem, frame_imagens, operacao)
        else:
            filtro = filtro_var.get()
            if filtro == "Média":
                matriz_aplicada = on_aplicar_filtro_media(caminho_imagem, frame_imagens)
            elif filtro == "Mediana":
                matriz_aplicada = ""
                on_aplicar_filtro_mediana(caminho_imagem, frame_imagens)
            elif filtro == "Passa Alta":
                matriz_aplicada = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
                on_aplicar_filtro_passa_alta(caminho_imagem, frame_imagens)
            elif filtro == "Roberts":
                matriz_aplicada_dupla = (np.array([[0, 0, 0], [0, 1, 0], [0, -1, 0]]),
                                         np.array([[0, 0, 0], [0, 1, -1], [0, 0, 0]]))
                on_aplicar_filtro_roberts(caminho_imagem, frame_imagens)
            elif filtro == "Roberts em X":
                matriz_aplicada = np.array([[0, 0, 0], [0, 1, 0], [0, -1, 0]])
                on_aplicar_filtro_roberts_x(caminho_imagem, frame_imagens)
            elif filtro == "Roberts em Y":
                matriz_aplicada = np.array([[0, 0, 0], [0, 1, -1], [0, 0, 0]])
                on_aplicar_filtro_roberts_y(caminho_imagem, frame_imagens)
            elif filtro == "Roberts Cruzado":
                matriz_aplicada_dupla = (np.array([[0, 0, 0], [0, 1, 0], [0, 0, -1]]),
                                         np.array([[0, 0, 0], [0, 0, 1], [0, -1, 0]]))
                on_aplicar_filtro_roberts_cruzado(caminho_imagem, frame_imagens)
            elif filtro == "Roberts Cruzado em X":
                matriz_aplicada = np.array([[0, 0, 0], [0, 1, 0], [0, 0, -1]])
                on_aplicar_filtro_roberts_cruzado_x(caminho_imagem, frame_imagens)
            elif filtro == "Roberts Cruzado em Y":
                matriz_aplicada = np.array([[0, 0, 0], [0, 0, 1], [0, -1, 0]])
                on_aplicar_filtro_roberts_cruzado_y(caminho_imagem, frame_imagens)
            elif filtro == "Prewitt":
                matriz_aplicada_dupla = (np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]),
                                         np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]))
                on_aplicar_filtro_prewitt(caminho_imagem, frame_imagens)
            elif filtro == "Prewitt em X":
                matriz_aplicada = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])
                on_aplicar_filtro_prewitt_x(caminho_imagem, frame_imagens)
            elif filtro == "Prewitt em Y":
                matriz_aplicada = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]])
                on_aplicar_filtro_prewitt_y(caminho_imagem, frame_imagens)
            elif filtro == "Sobel":
                matriz_aplicada_dupla = (np.array([[-1, 0, -1], [-2, 0, 2], [-1, 0, 1]]),
                                         np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]]))
                on_aplicar_filtro_sobel(caminho_imagem, frame_imagens)
            elif filtro == "Sobel em X":
                matriz_aplicada = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
                on_aplicar_filtro_sobel_x(caminho_imagem, frame_imagens)
            elif filtro == "Sobel em Y":
                matriz_aplicada = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
                on_aplicar_filtro_sobel_y(caminho_imagem, frame_imagens)
            elif filtro == "Alto Reforço":
                k = float(entry_k.get())


                matriz = []
                for linha in matriz_entries:
                    valores_linha = []
                    for entry in linha:
                        try:
                            valor = float(entry.get())
                        except ValueError:
                            valor = 0.0
                        valores_linha.append(valor)
                    matriz.append(valores_linha)

                matriz = np.array(matriz)
                on_aplicar_alto_reforco(caminho_imagem, frame_imagens, k, matriz)
            elif filtro == "Personalizável":

                matriz = []
                for linha in matriz_entries:
                    valores_linha = []
                    for entry in linha:
                        try:
                            valor = float(entry.get())
                        except ValueError:
                            valor = 0.0
                        valores_linha.append(valor)
                    matriz.append(valores_linha)

                matriz = np.array(matriz)
                on_aplicar_filtro_personalizado(caminho_imagem, frame_imagens, matriz)

        if isinstance(matriz_aplicada, np.ndarray):
            exibir_matriz_formatada(frame_matriz_aplicada, matriz_aplicada)
        elif matriz_aplicada_dupla:
            exibir_matrizes_duplas(frame_matriz_aplicada, matriz_aplicada_dupla)

    def exibir_matriz_formatada(frame, matriz):
        for widget in frame.winfo_children():
            widget.destroy()

        for i, linha in enumerate(matriz):
            for j, valor in enumerate(linha):
                label = tk.Label(frame, text=f"{valor:.2f}", width=6, relief="solid", borderwidth=1)
                label.grid(row=i, column=j, padx=2, pady=2)

    def exibir_matrizes_duplas(frame, matrizes):
        for widget in frame.winfo_children():
            widget.destroy()

        matriz1, matriz2 = matrizes

        for i, linha in enumerate(matriz1):
            for j, valor in enumerate(linha):
                label = tk.Label(frame, text=f"{valor:.2f}", width=6, relief="solid", borderwidth=1)
                label.grid(row=i, column=j, padx=2, pady=2)

        num_colunas = len(matriz1[0])
        spacer = tk.Label(frame, text="", width=2)
        spacer.grid(row=0, column=num_colunas, rowspan=len(matriz1))

        for i, linha in enumerate(matriz2):
            for j, valor in enumerate(linha):
                label = tk.Label(frame, text=f"{valor:.2f}", width=6, relief="solid", borderwidth=1)
                label.grid(row=i, column=j + num_colunas + 1, padx=2, pady=2)


    def mostrar_opcoes_alto_reforco(*args):
        if filtro_var.get() == "Alto Reforço":
            frame_matriz.pack_forget()
            label_k.pack(pady=5)
            entry_k.pack(pady=5)
            frame_matriz.pack(pady=10)
        elif filtro_var.get() == "Personalizável":
            for widget in frame_matriz_aplicada.winfo_children():
                widget.destroy()
            frame_matriz.pack_forget()
            frame_matriz.pack(pady=10)
            label_k.pack_forget()
            entry_k.pack_forget()
        else:
            label_k.pack_forget()
            entry_k.pack_forget()
            frame_matriz.pack_forget()

    filtro_var.trace("w", mostrar_opcoes_alto_reforco)

    botao_aplicar = tk.Button(janela_filtro, text="Aplicar Filtro", command=aplicar_filtro)
    botao_aplicar.pack(pady=10)