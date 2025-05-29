import numpy as np

def calcular_histograma(imagem):

    imagem = imagem.convert('L')
    
    imagem_array = np.array(imagem)
    
    histograma = [0] * 256
    
    for pixel in imagem_array.flatten():
        histograma[pixel] += 1
    
    return histograma