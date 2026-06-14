"""Entidades persistentes da NF-e e seus itens."""
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Text, Index, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.core.database import Base

# Precisões alinhadas ao leiaute da NF-e 4.00: quantidade até 4 casas,
# valor unitário até 10 casas, totais monetários com 2 casas. Usamos
# Numeric (Decimal) — nunca Float — para não introduzir erro de arredondamento
# que faria a soma do XML divergir e a SEFAZ rejeitar a nota.
_QTD = Numeric(15, 4)
_VALOR_UNIT = Numeric(21, 10)
_MONEY = Numeric(15, 2)


class NFe(Base):
    __tablename__ = "nfes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)

    # Identificação fiscal
    numero = Column(Integer, nullable=False)
    serie = Column(Integer, nullable=False, default=1)
    modelo = Column(String(2), nullable=False, default="55")
    chave_acesso = Column(String(44), nullable=True, index=True)
    protocolo = Column(String(20), nullable=True)
    ambiente = Column(String(20), nullable=False, default="homologacao")
    natureza_operacao = Column(String(60), nullable=False, default="VENDA DE MERCADORIA")
    finalidade = Column(String(2), nullable=False, default="1")
    tipo_operacao = Column(String(2), nullable=False, default="1")
    indicador_presenca = Column(String(2), nullable=False, default="1")

    # Estado
    status = Column(String(20), nullable=False, default="rascunho", index=True)
    motivo_rejeicao = Column(Text, nullable=True)
    codigo_status_sefaz = Column(String(10), nullable=True)

    # Cancelamento (evento)
    justificativa_cancelamento = Column(String(255), nullable=True)
    protocolo_cancelamento = Column(String(20), nullable=True)
    data_cancelamento = Column(DateTime(timezone=True), nullable=True)
    xml_cancelamento = Column(Text, nullable=True)

    # Destinatário (snapshot — não pode mudar após emissão)
    destinatario_documento = Column(String(14), nullable=False)
    destinatario_nome = Column(String(150), nullable=False)
    destinatario_ie = Column(String(20), nullable=True)
    destinatario_email = Column(String(150), nullable=True)
    destinatario_endereco = Column(Text, nullable=True)  # JSON serializado

    # Totais
    valor_produtos = Column(_MONEY, nullable=False, default=0)
    valor_total = Column(_MONEY, nullable=False, default=0)

    # Documentos
    xml_assinado = Column(Text, nullable=True)
    xml_autorizado = Column(Text, nullable=True)
    informacoes_adicionais = Column(Text, nullable=True)

    data_emissao = Column(DateTime(timezone=True), server_default=func.now())
    data_autorizacao = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    client = relationship("Client")
    itens = relationship("NFeItem", back_populates="nfe", cascade="all, delete-orphan", order_by="NFeItem.numero_item")

    __table_args__ = (
        Index("ix_nfes_user_status", "user_id", "status"),
        # O número fiscal só é único depois de atribuído na emissão (numero > 0).
        # Rascunhos nascem com numero=0 e não podem colidir entre si — por isso
        # o índice é parcial.
        Index(
            "ix_nfes_user_numero_serie",
            "user_id",
            "serie",
            "numero",
            unique=True,
            postgresql_where=text("numero > 0"),
        ),
    )


class NFeItem(Base):
    __tablename__ = "nfe_items"

    id = Column(Integer, primary_key=True, index=True)
    nfe_id = Column(Integer, ForeignKey("nfes.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    numero_item = Column(Integer, nullable=False)
    codigo = Column(String(60), nullable=False)
    descricao = Column(String(255), nullable=False)
    ncm = Column(String(8), nullable=False)
    cfop = Column(String(4), nullable=False)
    unidade_comercial = Column(String(6), nullable=False, default="UN")
    ean = Column(String(14), nullable=True)
    quantidade = Column(_QTD, nullable=False, default=0)
    valor_unitario = Column(_VALOR_UNIT, nullable=False, default=0)
    valor_total = Column(_MONEY, nullable=False, default=0)
    csosn = Column(String(3), nullable=False, default="102")
    origem = Column(String(1), nullable=False, default="0")

    nfe = relationship("NFe", back_populates="itens")
