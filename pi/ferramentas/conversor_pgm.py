from PIL import Image

def converter_para_pgm_p2(caminho_entrada, caminho_saida):
    # Abre a imagem e converte para escala de cinza
    img = Image.open(caminho_entrada).convert("L")
    
    largura, altura = img.size
    pixels = list(img.getdata())
    
    # Transforma lista 1D em matriz 2D
    dados_cinza = [pixels[i * largura:(i + 1) * largura] for i in range(altura)]

    # Salva no formato PGM ASCII (P2)
    with open(caminho_saida, "w") as f:
        f.write("P2\n")
        f.write(f"{largura} {altura}\n")
        f.write("255\n")
        for linha in dados_cinza:
            f.write(" ".join(map(str, linha)) + "\n")

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 3:
        sys.exit("Uso: python conversor_pgm.py <entrada.jpg|png> <saida.pgm>")
    converter_para_pgm_p2(sys.argv[1], sys.argv[2])
