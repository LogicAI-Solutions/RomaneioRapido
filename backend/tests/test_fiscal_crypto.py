"""Testes do CryptoService (criptografia em repouso de artefatos fiscais)."""
import pytest
from cryptography.fernet import Fernet

from backend.fiscal.domain.exceptions import CertificateError
from backend.fiscal.services import crypto_service as cs
from backend.fiscal.services.crypto_service import (
    CryptoService,
    FiscalEncryptionKeyError,
)


def test_roundtrip_bytes_e_texto():
    service = CryptoService(key=Fernet.generate_key())
    assert service.decrypt(service.encrypt(b"abc")) == b"abc"
    assert service.decrypt_text(service.encrypt_text("olá fiscal")) == "olá fiscal"


def test_decrypt_token_invalido_vira_certificate_error():
    service = CryptoService(key=Fernet.generate_key())
    with pytest.raises(CertificateError):
        service.decrypt(b"token-corrompido")


def test_chaves_distintas_nao_se_decifram():
    a = CryptoService(key=Fernet.generate_key())
    b = CryptoService(key=Fernet.generate_key())
    token = a.encrypt(b"segredo")
    with pytest.raises(CertificateError):
        b.decrypt(token)


def test_producao_exige_chave(monkeypatch):
    monkeypatch.setattr(cs.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(cs.settings, "FISCAL_ENCRYPTION_KEY", None)
    with pytest.raises(FiscalEncryptionKeyError):
        CryptoService()


def test_chave_configurada_invalida_sempre_falha(monkeypatch):
    monkeypatch.setattr(cs.settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(cs.settings, "FISCAL_ENCRYPTION_KEY", "chave-curta-invalida")
    with pytest.raises(FiscalEncryptionKeyError):
        CryptoService()


def test_dev_sem_chave_usa_fallback_do_secret_key(monkeypatch):
    monkeypatch.setattr(cs.settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(cs.settings, "FISCAL_ENCRYPTION_KEY", None)
    monkeypatch.setattr(cs.settings, "SECRET_KEY", "uma-secret-key-de-teste")
    service = CryptoService()
    assert service.decrypt(service.encrypt(b"ok")) == b"ok"


def test_chave_fernet_valida_e_aceita(monkeypatch):
    chave = Fernet.generate_key().decode("utf-8")
    monkeypatch.setattr(cs.settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(cs.settings, "FISCAL_ENCRYPTION_KEY", chave)
    service = CryptoService()
    assert service.decrypt(service.encrypt(b"ok")) == b"ok"
