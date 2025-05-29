import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from utils.calcular_histograma import calcular_histograma

def equalizar_histograma(imagem):

    imagem_pil = Image.open(imagem)
    histograma = calcular_histograma(imagem_pil)
    
    total_pixels = sum(histograma)
    histograma_normalizado = [h / total_pixels for h in histograma]
    
    cdf = np.cumsum(histograma_normalizado)
    
    cdf_normalizada = np.uint8(255 * cdf)
    
    imagem_pil = imagem_pil.convert('L')
    imagem_array = np.array(imagem_pil)
    
    imagem_equalizada = cdf_normalizada[imagem_array]
    
    imagem_equalizada = Image.fromarray(imagem_equalizada)
    histograma_equalizado = calcular_histograma(imagem_equalizada)
    
    return histograma, imagem_equalizada, histograma_equalizado