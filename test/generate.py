import qrcode
import barcode
from barcode.writer import ImageWriter
import os

os.makedirs("test/output", exist_ok=True)

# 1. Gerar Produtos em QR Code
produtos_qr = [
    ("Produto A - Eletronico", "QR-ELEC-001"),
    ("Produto B - Smartphone", "QR-PHONE-992"),
    ("Produto C - Fone Bluetooth", "QR-AUDIO-554")
]

for nome, codigo in produtos_qr:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(codigo)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    nome_arquivo = f"test_codes/output/{nome.replace(' ', '_')}.png"
    img.save(nome_arquivo)
    print(f"Gerado QR Code: {nome_arquivo} (Codigo: {codigo})")

# 2. Gerar Produtos em Codigo de Barras (EAN13)
produtos_barras = [
    ("Produto D - Teclado Mecanico", "789123456789"),
    ("Produto E - Mouse Gamer", "789987654321"),
    ("Produto F - Monitor 24", "789111222333")
]

for nome, codigo in produtos_barras:
    # EAN13 precisa de 12 ou 13 digitos
    EAN = barcode.get_barcode_class('ean13')
    ean = EAN(codigo, writer=ImageWriter())
    nome_arquivo = f"test_codes/output/{nome.replace(' ', '_')}"
    ean.save(nome_arquivo)
    print(f"Gerado Codigo de Barras: {nome_arquivo}.png (Codigo: {codigo})")

print("Todos os codigos de teste foram gerados na pasta 'test_codes/output'!")
