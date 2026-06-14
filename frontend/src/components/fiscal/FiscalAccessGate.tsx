/**
 * Bloqueio visual do módulo fiscal para quem não tem plano pago.
 *
 * Para clientes com acesso (admin/unlimited ou plano Básico+) renderiza o
 * conteúdo normalmente. Para quem está só no trial (sem assinatura), exibe uma
 * prévia borrada e uma chamada para assinar — funcionando como upsell.
 *
 * Quando bloqueado NÃO montamos os componentes reais: eles fazem chamadas à API
 * fiscal (que retornam 403) e gerariam toasts de erro. Em vez disso mostramos um
 * esqueleto decorativo. A segurança real continua no backend
 * (`require_fiscal_access`).
 */
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { hasFiscalAccess } from '@/utils/fiscalAccess'

export default function FiscalAccessGate({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const navigate = useNavigate()

    if (hasFiscalAccess(user)) {
        return <>{children}</>
    }

    return (
        <div className="relative p-6 max-w-5xl mx-auto min-h-[70vh]">
            {/* Prévia decorativa borrada (sem rede, sem interação) */}
            <div className="pointer-events-none select-none blur-md space-y-6 animate-pulse" aria-hidden="true">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100" />
                    <div className="space-y-2">
                        <div className="h-5 w-56 rounded bg-border" />
                        <div className="h-3 w-80 rounded bg-border/60" />
                    </div>
                </div>
                <div className="h-40 rounded-2xl bg-card border border-border" />
                <div className="h-72 rounded-2xl bg-card border border-border" />
            </div>

            {/* Overlay centralizado com a mensagem de upgrade */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">
                        Funcionalidade exclusiva de planos pagos
                    </h2>
                    <p className="text-sm text-text-secondary mt-2">
                        Para acessar a emissão de Notas Fiscais Eletrônicas é necessário ter no mínimo o plano Básico.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/perfil?tab=subscription')}
                        className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors w-full"
                    >
                        Conhecer os planos
                    </button>
                </div>
            </div>
        </div>
    )
}
