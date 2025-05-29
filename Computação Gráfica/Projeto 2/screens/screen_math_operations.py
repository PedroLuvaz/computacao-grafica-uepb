import cv2
import tkinter as tk
from PIL import Image, ImageTk
from transformations.operacoes_matematicas import (
    soma_imagens, subtracao_imagens, multiplicacao_imagens, 
    divisao_imagens, or_imagens, and_imagens, xor_imagens
)

def abrir_tela_operacoes_imagem(janela):
    janela_operacoes = tk.Toplevel(janela)
    janela_operacoes.title("Operações com Imagem")
    janela_operacoes.geometry("800x600")
    janela_operacoes.geometry("1020x720")
    janela_operacoes.configure(bg="#D3D3D3")
    
    caminho_imagens = 'images' 

    imagem1_selecionada = tk.StringVar(janela_operacoes)
    imagem2_selecionada = tk.StringVar(janela_operacoes)

    opcoes_imagens = ["Lena.pgm", "Airplane.pgm"]

    menu_imagem1 = tk.OptionMenu(janela_operacoes, imagem1_selecionada, *opcoes_imagens)
    menu_imagem1.pack(pady=5)
    
    menu_imagem2 = tk.OptionMenu(janela_operacoes, imagem2_selecionada, *opcoes_imagens)
    menu_imagem2.pack(pady=5)
    
    operacao_var = tk.StringVar(janela_operacoes)
    operacao_var.set("Soma")

    opcoes_operacoes = ["Soma", "Subtração", "Multiplicação", "Divisão", "OR", "AND", "XOR"]
    menu_operacoes = tk.OptionMenu(janela_operacoes, operacao_var, *opcoes_operacoes)
    menu_operacoes.pack(pady=10)
    
    resultado_imagem_label = None
    resultado_label = None

    def aplicar_operacao():
        imagem1 = f"{caminho_imagens}/{imagem1_selecionada.get()}"
        imagem2 = f"{caminho_imagens}/{imagem2_selecionada.get()}"
        
        operacao = operacao_var.get()
        
        if operacao == "Soma":
            resultado = soma_imagens(imagem1, imagem2)
        elif operacao == "Subtração":
            resultado = subtracao_imagens(imagem1, imagem2)
        elif operacao == "Multiplicação":
            resultado = multiplicacao_imagens(imagem1, imagem2)
        elif operacao == "Divisão":
            resultado = divisao_imagens(imagem1, imagem2)
        elif operacao == "OR":
            resultado = or_imagens(imagem1, imagem2)
        elif operacao == "AND":
            resultado = and_imagens(imagem1, imagem2)
        elif operacao == "XOR":
            resultado = xor_imagens(imagem1, imagem2)
        
        if resultado is not None:
            exibir_resultado(resultado)

    def exibir_resultado(imagem_resultado):
        nonlocal resultado_imagem_label
        nonlocal resultado_label

        if resultado_imagem_label is not None:
            resultado_imagem_label.destroy()
        if resultado_label is not None:
            resultado_label.destroy()
        
        resultado_label = tk.Label(janela_operacoes, text="Resultado da Operação:")
        resultado_label.pack(pady=5)

        imagem = cv2.imread(imagem_resultado, cv2.IMREAD_GRAYSCALE)
        resultado_imagem = ImageTk.PhotoImage(Image.fromarray(imagem))
        
        resultado_imagem_label = tk.Label(janela_operacoes, image=resultado_imagem)
        resultado_imagem_label.image = resultado_imagem
        resultado_imagem_label.pack(pady=10)

    botao_aplicar = tk.Button(janela_operacoes, text="Aplicar Operação", command=aplicar_operacao)
    botao_aplicar.pack(pady=20)
