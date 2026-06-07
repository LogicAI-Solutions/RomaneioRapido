"""CryptoService: criptografia simétrica em repouso para artefatos fiscais.

Usa Fernet (AES-128-CBC + HMAC-SHA256) da biblioteca `cryptography`.
A chave DEVE ser fornecida via `FISCAL_ENCRYPTION_KEY` (Fernet key base64
urlsafe de 32 bytes). Em ambientes que não sejam de produção, é tolerado um
fallback determinístico derivado do `SECRET_KEY` — apenas para facilitar o
desenvolvimento; nunca para produção (rotacionar o SECRET_KEY tornaria todos
os certificados indecifráveis).

Responsabilidade única: cifrar/decifrar bytes. Não conhece banco de dados,
não conhece NF-e, não conhece HTTP.
"""
from __future__ import annotations

import base64
import hashlib
import logging

from cryptography.fernet import Fernet, InvalidToken

from backend.core.config import settings
from backend.fiscal.domain.exceptions import CertificateError

logger = logging.getLogger(__name__)


class FiscalEncryptionKeyError(RuntimeError):
    """Configuração da chave de criptografia fiscal ausente ou inválida."""


class CryptoService:
    def __init__(self, key: bytes | None = None) -> None:
        self._fernet = Fernet(key or self._resolve_key())

    @staticmethod
    def _is_production() -> bool:
        return (settings.ENVIRONMENT or "").strip().lower() == "production"

    @classmethod
    def _resolve_key(cls) -> bytes:
        configured = settings.FISCAL_ENCRYPTION_KEY
        if configured:
            raw = configured.encode("utf-8")
            if cls._is_valid_fernet_key(raw):
                return raw
            # Chave fornecida porém inválida: nunca silenciar — em qualquer
            # ambiente isso é erro de configuração que precisa ser corrigido.
            raise FiscalEncryptionKeyError(
                "FISCAL_ENCRYPTION_KEY inválida: gere uma chave com "
                "`cryptography.fernet.Fernet.generate_key()` (base64 urlsafe de 32 bytes)."
            )

        if cls._is_production():
            raise FiscalEncryptionKeyError(
                "FISCAL_ENCRYPTION_KEY é obrigatória em produção. Defina-a com uma "
                "chave Fernet estável; do contrário os certificados não poderão ser "
                "decifrados após uma rotação do SECRET_KEY."
            )

        logger.warning(
            "FISCAL_ENCRYPTION_KEY não definida — derivando chave do SECRET_KEY "
            "(apenas para desenvolvimento). NÃO use isto em produção."
        )
        digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
        return base64.urlsafe_b64encode(digest)

    @staticmethod
    def _is_valid_fernet_key(raw: bytes) -> bool:
        """Uma chave Fernet válida é base64 urlsafe de exatamente 32 bytes."""
        try:
            return len(base64.urlsafe_b64decode(raw)) == 32
        except Exception:
            return False

    def encrypt(self, data: bytes) -> bytes:
        if not isinstance(data, (bytes, bytearray)):
            raise TypeError("encrypt espera bytes")
        return self._fernet.encrypt(bytes(data))

    def decrypt(self, token: bytes) -> bytes:
        try:
            return self._fernet.decrypt(bytes(token))
        except InvalidToken as exc:
            raise CertificateError("Falha ao decifrar artefato fiscal.") from exc

    def encrypt_text(self, text: str) -> bytes:
        return self.encrypt(text.encode("utf-8"))

    def decrypt_text(self, token: bytes) -> str:
        return self.decrypt(token).decode("utf-8")
