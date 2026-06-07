from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from backend.fiscal.dependencies import require_fiscal_access


def _user(**overrides):
    data = {
        "is_admin": False,
        "is_unlimited": False,
        "plan_id": "trial",
        "subscription_status": "active",
        "created_at": None,
        "trial_days": 7,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def test_fiscal_access_allows_basic_paid_user():
    user = _user(plan_id="basic")

    assert require_fiscal_access(user) is user


def test_fiscal_access_blocks_trial_user():
    with pytest.raises(HTTPException) as exc:
        require_fiscal_access(_user(plan_id="trial"))

    assert exc.value.status_code == 403
    assert "plano Básico" in exc.value.detail


def test_fiscal_access_blocks_unpaid_subscription():
    with pytest.raises(HTTPException) as exc:
        require_fiscal_access(_user(plan_id="basic", subscription_status="unpaid"))

    assert exc.value.status_code == 403
    assert "suspensa" in exc.value.detail


def test_fiscal_access_allows_admin_even_on_trial():
    user = _user(is_admin=True, plan_id="trial")

    assert require_fiscal_access(user) is user
