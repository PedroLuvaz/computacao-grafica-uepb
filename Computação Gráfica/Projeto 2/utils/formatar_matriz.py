def formatar_matriz(matriz):
    return "\n".join(["\t".join([f"{elem:.2f}" for elem in linha]) for linha in matriz])