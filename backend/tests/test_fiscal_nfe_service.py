"""Testes do NFeService.

O design por injeção de dependência (DIP) permite exercitar toda a regra de
negócio com dublês em memória — sem banco de dados, sem PyNFe e sem SEFAZ.
"""
from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace

import pytest

# Importa os modelos para que o registry do SQLAlchemy consiga resolver os
# nomes de relacionamento (ex.: relationship("User")) ao configurar os mappers
# na primeira instanciação de NFe. Sem isto, a config dos mappers falha.
from backend.models import users as _users  # noqa: F401
from backend.models import clients as _clients  # noqa: F401
from backend.models import products as _products  # noqa: F401
from backend.models import categories as _categories  # noqa: F401
from backend.models import product_groups as _groups  # noqa: F401
from backend.models import inventory as _inventory  # noqa: F401
from backend.models import api_keys as _api_keys  # noqa: F401
from backend.models import auth_sessions as _auth_sessions  # noqa: F401
from backend.models import pending_romaneio as _pending  # noqa: F401
from backend.fiscal.models import (  # noqa: F401
    FiscalCertificate as _FiscalCertificate,
    FiscalConfig as _FiscalConfig,
)

from backend.fiscal.domain.enums import NFeStatus
from backend.fiscal.domain.exceptions import (
    FiscalValidationError,
    NFeNotFoundError,
    NFeStateError,
    SefazError,
    SefazRejectedError,
)
from backend.fiscal.domain.value_objects import (
    ResultadoCancelamento,
    ResultadoTransmissao,
)
from backend.fiscal.services.nfe_service import NFeService


# ── Dublês ───────────────────────────────────────────────────────────────────
class FakeNFeRepository:
    def __init__(self):
        self._store = {}
        self._seq = 0

    def add(self, nfe):
        self._seq += 1
        nfe.id = self._seq
        self._store[nfe.id] = nfe
        return nfe

    def save(self, nfe):
        self._store[nfe.id] = nfe
        return nfe

    def get(self, user_id, nfe_id):
        nfe = self._store.get(nfe_id)
        if nfe and nfe.user_id == user_id:
            return nfe
        return None


class FakeConfigRepository:
    def __init__(self, serie=1, numero=10):
        self._serie = serie
        self._numero = numero

    def reserve_next_number(self, user_id):
        numero = self._numero
        self._numero += 1
        return numero, self._serie


class FakeConfigService:
    def __init__(self, config):
        self._config = config

    def require(self, user_id):
        return self._config


class FakeCertificateService:
    def load_material(self, user_id):
        return SimpleNamespace(pfx_bytes=b"pfx", password="x", subject_cn=None, not_after=None)


class FakeBuilder:
    def build(self, dados):
        return "<NFe/>"


class FakeSigner:
    def sign(self, xml, material):
        return xml + "<signed/>"


class FakeTransmitter:
    def __init__(self, *, transmitir_result=None, transmitir_exc=None,
                 cancelar_result=None, cancelar_exc=None):
        self._transmitir_result = transmitir_result
        self._transmitir_exc = transmitir_exc
        self._cancelar_result = cancelar_result
        self._cancelar_exc = cancelar_exc

    def transmitir(self, xml_assinado, contexto):
        if self._transmitir_exc:
            raise self._transmitir_exc
        return self._transmitir_result

    def cancelar(self, *, chave, protocolo, justificativa, contexto):
        if self._cancelar_exc:
            raise self._cancelar_exc
        return self._cancelar_result


# ── Fixtures / helpers ───────────────────────────────────────────────────────
def _config():
    return SimpleNamespace(
        cnpj="11222333000181",
        razao_social="Empresa Teste LTDA",
        nome_fantasia="Teste",
        inscricao_estadual="123456789",
        inscricao_municipal=None,
        cnae_fiscal="4751201",
        regime_tributario="1",
        logradouro="Rua A",
        numero="100",
        complemento=None,
        bairro="Centro",
        municipio="São Paulo",
        cod_municipio_ibge="3550308",
        uf="SP",
        cep="01001000",
        serie_padrao=1,
        ambiente="homologacao",
    )


def _payload(**overrides):
    payload = {
        "client_id": None,
        "natureza_operacao": "VENDA DE MERCADORIA",
        "finalidade": "1",
        "tipo_operacao": "1",
        "indicador_presenca": "1",
        "informacoes_adicionais": None,
        "destinatario": {
            "nome": "Cliente Final",
            "documento": "52998224725",
            "inscricao_estadual": None,
            "email": None,
            "endereco": None,
        },
        "itens": [
            {
                "codigo": "P1",
                "descricao": "Produto 1",
                "ncm": "12345678",
                "cfop": "5102",
                "unidade_comercial": "UN",
                "quantidade": "3",
                "valor_unitario": "10.50",
                "csosn": "102",
                "origem": "0",
            }
        ],
    }
    payload.update(overrides)
    return payload


def _make_service(transmitter=None, config_repo=None):
    return NFeService(
        nfe_repository=FakeNFeRepository(),
        fiscal_config_repository=config_repo or FakeConfigRepository(),
        fiscal_config_service=FakeConfigService(_config()),
        certificate_service=FakeCertificateService(),
        xml_builder=FakeBuilder(),
        xml_signer=FakeSigner(),
        transmitter=transmitter or FakeTransmitter(),
    )


def _resultado_ok():
    return ResultadoTransmissao(
        sucesso=True,
        status_codigo="100",
        status_motivo="Autorizado o uso da NF-e",
        protocolo="135200000000001",
        chave_acesso="3" * 44,
        xml_autorizado="<nfeProc/>",
        data_autorizacao=datetime.now(timezone.utc),
    )


# ── create_draft ─────────────────────────────────────────────────────────────
def test_create_draft_calcula_total_com_decimal():
    service = _make_service()
    nfe = service.create_draft(user_id=1, payload=_payload())

    assert nfe.status == NFeStatus.RASCUNHO.value
    assert nfe.numero == 0
    assert nfe.valor_produtos == Decimal("31.50")
    assert nfe.valor_total == Decimal("31.50")
    assert len(nfe.itens) == 1
    assert nfe.itens[0].valor_total == Decimal("31.50")


def test_create_draft_rejeita_documento_invalido():
    service = _make_service()
    payload = _payload()
    payload["destinatario"]["documento"] = "12345678900"
    with pytest.raises(FiscalValidationError):
        service.create_draft(user_id=1, payload=payload)


def test_create_draft_rejeita_sem_itens():
    service = _make_service()
    with pytest.raises(FiscalValidationError):
        service.create_draft(user_id=1, payload=_payload(itens=[]))


def test_create_draft_rejeita_ncm_invalido():
    service = _make_service()
    payload = _payload()
    payload["itens"][0]["ncm"] = "123"
    with pytest.raises(FiscalValidationError):
        service.create_draft(user_id=1, payload=payload)


# ── issue ────────────────────────────────────────────────────────────────────
def test_issue_autoriza_e_atribui_numero():
    transmitter = FakeTransmitter(transmitir_result=_resultado_ok())
    service = _make_service(transmitter=transmitter, config_repo=FakeConfigRepository(numero=10))
    nfe = service.create_draft(user_id=1, payload=_payload())

    emitida = service.issue(user_id=1, nfe_id=nfe.id)

    assert emitida.status == NFeStatus.AUTORIZADA.value
    assert emitida.numero == 10
    assert emitida.protocolo == "135200000000001"
    assert emitida.chave_acesso == "3" * 44


def test_issue_rejeitada_persiste_motivo_e_propaga():
    exc = SefazRejectedError("rejeitada", codigo="539", motivo="Duplicidade")
    transmitter = FakeTransmitter(transmitir_exc=exc)
    service = _make_service(transmitter=transmitter)
    nfe = service.create_draft(user_id=1, payload=_payload())

    with pytest.raises(SefazRejectedError):
        service.issue(user_id=1, nfe_id=nfe.id)

    assert nfe.status == NFeStatus.REJEITADA.value
    assert nfe.codigo_status_sefaz == "539"
    assert nfe.motivo_rejeicao == "Duplicidade"


def test_issue_falha_de_rede_marca_erro_para_retry():
    transmitter = FakeTransmitter(transmitir_exc=SefazError("timeout"))
    service = _make_service(transmitter=transmitter)
    nfe = service.create_draft(user_id=1, payload=_payload())

    with pytest.raises(SefazError):
        service.issue(user_id=1, nfe_id=nfe.id)

    # Não pode ficar preso em ASSINADA — precisa permitir nova tentativa.
    assert nfe.status == NFeStatus.ERRO.value


def test_issue_estado_invalido_bloqueia():
    transmitter = FakeTransmitter(transmitir_result=_resultado_ok())
    service = _make_service(transmitter=transmitter)
    nfe = service.create_draft(user_id=1, payload=_payload())
    service.issue(user_id=1, nfe_id=nfe.id)  # vai para AUTORIZADA

    with pytest.raises(NFeStateError):
        service.issue(user_id=1, nfe_id=nfe.id)


def test_issue_nfe_inexistente():
    service = _make_service()
    with pytest.raises(NFeNotFoundError):
        service.issue(user_id=1, nfe_id=999)


def test_issue_respeita_isolamento_por_usuario():
    transmitter = FakeTransmitter(transmitir_result=_resultado_ok())
    service = _make_service(transmitter=transmitter)
    nfe = service.create_draft(user_id=1, payload=_payload())
    with pytest.raises(NFeNotFoundError):
        service.issue(user_id=2, nfe_id=nfe.id)


# ── cancel ───────────────────────────────────────────────────────────────────
def _emitir(service):
    nfe = service.create_draft(user_id=1, payload=_payload())
    return service.issue(user_id=1, nfe_id=nfe.id)


def test_cancel_sucesso():
    transmitter = FakeTransmitter(
        transmitir_result=_resultado_ok(),
        cancelar_result=ResultadoCancelamento(
            sucesso=True,
            status_codigo="135",
            status_motivo="Evento registrado e vinculado a NF-e",
            protocolo="135200000000999",
            xml_evento="<retEvento/>",
            data_evento=datetime.now(timezone.utc),
        ),
    )
    service = _make_service(transmitter=transmitter)
    nfe = _emitir(service)

    cancelada = service.cancel(user_id=1, nfe_id=nfe.id, justificativa="Erro no pedido do cliente")

    assert cancelada.status == NFeStatus.CANCELADA.value
    assert cancelada.protocolo_cancelamento == "135200000000999"
    assert cancelada.justificativa_cancelamento == "Erro no pedido do cliente"


def test_cancel_justificativa_curta():
    service = _make_service(transmitter=FakeTransmitter(transmitir_result=_resultado_ok()))
    nfe = _emitir(service)
    with pytest.raises(FiscalValidationError):
        service.cancel(user_id=1, nfe_id=nfe.id, justificativa="curta")


def test_cancel_so_permite_autorizada():
    service = _make_service()
    nfe = service.create_draft(user_id=1, payload=_payload())  # ainda RASCUNHO
    with pytest.raises(NFeStateError):
        service.cancel(user_id=1, nfe_id=nfe.id, justificativa="Justificativa válida e longa")


def test_cancel_rejeitado_pela_sefaz_propaga():
    transmitter = FakeTransmitter(
        transmitir_result=_resultado_ok(),
        cancelar_exc=SefazRejectedError("fora do prazo", codigo="573", motivo="Prazo excedido"),
    )
    service = _make_service(transmitter=transmitter)
    nfe = _emitir(service)
    with pytest.raises(SefazRejectedError):
        service.cancel(user_id=1, nfe_id=nfe.id, justificativa="Justificativa válida e longa")
