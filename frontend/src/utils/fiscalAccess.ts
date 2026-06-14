import type { User } from '@/context/AuthContext'

// Planos pagos que liberam o módulo fiscal (espelha _FISCAL_PAID_PLANS no backend).
const FISCAL_PAID_PLANS = ['basic', 'plus', 'pro', 'api', 'enterprise']

/**
 * Regra única de acesso ao módulo de Nota Fiscal no frontend.
 *
 * Libera para admin/unlimited ou clientes a partir do plano Básico com
 * assinatura em dia. A emissão também é validada no backend
 * (`require_fiscal_access`); aqui controlamos apenas a experiência da UI.
 */
export function hasFiscalAccess(user: User | null | undefined): boolean {
    if (!user) return false
    if (user.is_admin || user.is_unlimited || user.plan_id === 'unlimited') return true
    if (!FISCAL_PAID_PLANS.includes(user.plan_id)) return false
    return user.subscription_status !== 'unpaid'
}
