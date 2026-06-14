"""Testes dos validadores e formatadores fiscais (funções puras)."""
from decimal import Decimal

import pytest

from backend.fiscal.validators import (
    format_cep,
    format_cnpj,
    format_cpf,
    format_currency_brl,
    is_valid_cep,
    is_valid_cfop,
    is_valid_cnpj,
    is_valid_cpf,
    is_valid_csosn,
    is_valid_ncm,
    normalize_uf,
    strip_non_digits,
)


# ── CPF ──────────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("cpf", ["529.982.247-25", "52998224725"])
def test_cpf_valido(cpf):
    assert is_valid_cpf(cpf) is True


@pytest.mark.parametrize("cpf", ["111.111.111-11", "12345678900", "123", ""])
def test_cpf_invalido(cpf):
    assert is_valid_cpf(cpf) is False


# ── CNPJ ─────────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("cnpj", ["11.222.333/0001-81", "11222333000181"])
def test_cnpj_valido(cnpj):
    assert is_valid_cnpj(cnpj) is True


@pytest.mark.parametrize("cnpj", ["11.111.111/1111-11", "11222333000100", "abc", ""])
def test_cnpj_invalido(cnpj):
    assert is_valid_cnpj(cnpj) is False


# ── NCM / CFOP / CSOSN ───────────────────────────────────────────────────────
@pytest.mark.parametrize("ncm", ["12345678", "1234", "12"])
def test_ncm_valido(ncm):
    assert is_valid_ncm(ncm) is True


@pytest.mark.parametrize("ncm", ["123", "123456789", "", "abcdefgh"])
def test_ncm_invalido(ncm):
    assert is_valid_ncm(ncm) is False


@pytest.mark.parametrize("cfop", ["5102", "6108", "1202"])
def test_cfop_valido(cfop):
    assert is_valid_cfop(cfop) is True


@pytest.mark.parametrize("cfop", ["4102", "510", "51022", "abcd", ""])
def test_cfop_invalido(cfop):
    assert is_valid_cfop(cfop) is False


@pytest.mark.parametrize("csosn", ["101", "102", "300", "400", "900"])
def test_csosn_valido(csosn):
    assert is_valid_csosn(csosn) is True


@pytest.mark.parametrize("csosn", ["000", "999", ""])
def test_csosn_invalido(csosn):
    assert is_valid_csosn(csosn) is False


# ── Endereço ─────────────────────────────────────────────────────────────────
def test_cep_e_uf():
    assert is_valid_cep("01001-000") is True
    assert is_valid_cep("123") is False
    assert normalize_uf("sp") == "SP"
    assert normalize_uf("XX") is None


# ── Formatadores ─────────────────────────────────────────────────────────────
def test_formatadores():
    assert format_cnpj("11222333000181") == "11.222.333/0001-81"
    assert format_cpf("52998224725") == "529.982.247-25"
    assert format_cep("01001000") == "01001-000"
    assert strip_non_digits("a1b2c3") == "123"


@pytest.mark.parametrize(
    "valor,esperado",
    [
        (Decimal("1234.5"), "R$ 1.234,50"),
        (Decimal("0"), "R$ 0,00"),
        (1000000, "R$ 1.000.000,00"),
        (9.99, "R$ 9,99"),
    ],
)
def test_format_currency_brl(valor, esperado):
    assert format_currency_brl(valor) == esperado
