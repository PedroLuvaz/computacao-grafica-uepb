import cv2

def carregar_imagem(imagem_path):
    imagem = cv2.imread(imagem_path, cv2.IMREAD_GRAYSCALE)
    if imagem is None:
        raise ValueError(f"Imagem não encontrada: {imagem_path}")
    return imagem.astype('int32')
