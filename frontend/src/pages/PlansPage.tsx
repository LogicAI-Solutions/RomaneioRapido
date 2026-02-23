import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Package, LayoutDashboard, Loader2 } from 'lucide-react'
import { PLANS } from '../constants/plans'
import type { Plan } from '../constants/plans'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

export default function PlansPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [usage, setUsage] = useState({
        products: { used: 0, limit: 10 },
        categories: { used: 0, limit: 2 },
        plan_id: user?.plan_id || 'free'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
    const currentPlan = PLANS.find(p => p.id === (user?.plan_id || usage.plan_id)) || PLANS[0]

    const fetchData = async () => {
        try {
            const res = await api.get('/plans/usage')
            setUsage(res.data)
        } catch (err) {
            console.error('Erro ao buscar uso dos planos:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubscribe = async (planId: string) => {
        if (planId === user?.plan_id) return

        setIsSubscribing(planId)
        try {
            await api.patch('/plans/subscribe', { plan_id: planId })
            // Recarregar a página para atualizar o contexto e o uso
            window.location.reload()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao atualizar assinatura')
        } finally {
            setIsSubscribing(null)
        }
    }

    const calculateProgress = (used: number, limit: number) => {
        if (limit >= 999999) return 0
        return Math.min((used / limit) * 100, 100)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header minimalista */}
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Romaneio<span className="text-blue-600">Rapido</span></span>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboards
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-50 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-bold border border-gray-100 hover:bg-gray-100 transition-all font-inter"
                        >
                            Logado como {user?.full_name}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col items-center w-full">
                <div className="text-center mb-16 max-w-2xl">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 font-inter">Escolha seu plano</h1>
                    <p className="text-gray-500 font-medium">Aumente os limites da sua conta e desbloqueie recursos exclusivos</p>
                </div>

                {/* Card de Uso Atual - Estilo Vitrine Rápida */}
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-[24px] p-8 mb-16 relative overflow-hidden w-full max-w-4xl mx-auto">
                    <div className="relative z-10 font-inter">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Seu plano atual</p>
                                <h2 className="text-3xl font-extrabold text-gray-900">{currentPlan.name}</h2>
                            </div>
                            <div className="flex gap-8">
                                <div className="text-right">
                                    <p className="text-2xl font-black text-gray-900">{usage.products.used}/{usage.products.limit >= 999999 ? '∞' : usage.products.limit}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Produtos</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-gray-900">{usage.categories.used}/{usage.categories.limit >= 999999 ? '∞' : usage.categories.limit}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categorias</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Produtos utilizados</span>
                                    <span className="text-sm font-bold text-emerald-600">{Math.round(calculateProgress(usage.products.used, usage.products.limit))}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{ width: `${calculateProgress(usage.products.used, usage.products.limit)}% ` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700">Categorias utilizadas</span>
                                    <span className="text-sm font-bold text-blue-600">{Math.round(calculateProgress(usage.categories.used, usage.categories.limit))}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{ width: `${calculateProgress(usage.categories.used, usage.categories.limit)}% ` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Planos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4">
                    {PLANS.filter(p => !p.hidden).map((plan: Plan) => {
                        const actualPlanId = user?.plan_id || usage.plan_id;
                        const effectivePlanId = actualPlanId === 'enterprise' ? 'pro' : actualPlanId;

                        return (
                            <div
                                key={plan.id}
                                className={`relative p-6 rounded-[24px] border transition-all duration-300 flex flex-col font-inter h-full ${plan.id === effectivePlanId
                                    ? 'border-emerald-500 bg-white ring-4 ring-emerald-50'
                                    : plan.highlight
                                        ? 'border-blue-600 shadow-xl shadow-blue-600/10 scale-105 z-10 bg-white'
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                {plan.id === effectivePlanId && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                        Plano Ativo
                                    </div>
                                )}
                                {plan.highlight && plan.id !== effectivePlanId && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                        Mais Popular
                                    </div>
                                )}

                                <div className="mb-6 text-center pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-[13px] text-gray-500 leading-relaxed min-h-[40px] px-2">{plan.description}</p>
                                </div>

                                <div className="flex flex-col items-center mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                                        {plan.period && <span className="text-gray-400 font-bold text-xs">{plan.period}</span>}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Produtos</span>
                                        <span className="text-sm font-extrabold text-gray-900">{plan.limit_products >= 999999 ? 'Ilimitado' : plan.limit_products}</span>
                                    </div>

                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex items-start gap-3 px-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-blue-600 font-bold" />
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={plan.id === effectivePlanId || isSubscribing === plan.id}
                                    className={`w-full py-4 rounded-[12px] font-bold text-sm transition-all duration-200 mt-auto flex items-center justify-center gap-2 ${plan.id === effectivePlanId
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.highlight
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                            : 'bg-white text-gray-800 border-2 border-gray-100 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                >
                                    {isSubscribing === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {plan.id === effectivePlanId
                                        ? 'Plano Ativo'
                                        : (PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === effectivePlanId)
                                            ? 'Fazer Upgrade'
                                            : 'Mudar de Plano')}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
