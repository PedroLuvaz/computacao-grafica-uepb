def salvar_imagem_pgm(imagem_resultado, nome_arquivo, destino_pasta="images/images_result_operations"):
    import os
    if not os.path.exists(destino_pasta):
        os.makedirs(destino_pasta)
    
    caminho_arquivo = os.path.join(destino_pasta, nome_arquivo)
    
    with open(caminho_arquivo, 'w') as arquivo:
        arquivo.write("P2\n")
        arquivo.write(f"{imagem_resultado.shape[1]} {imagem_resultado.shape[0]}\n")
        arquivo.write("255\n")

        for linha in imagem_resultado:
            linha_texto = ' '.join(map(str, linha))
            arquivo.write(linha_texto + '\n')
    
    return caminho_arquivo
