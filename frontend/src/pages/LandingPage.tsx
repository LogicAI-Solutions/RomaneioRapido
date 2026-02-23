import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    Package,
    BarChart3,
    ScanBarcode,
    ArrowRight,
    Menu,
    X,
    Boxes,
    ClipboardList,
    Truck,
    Mail,
    Shield,
    Zap,
    Globe,
    ChevronRight,
    Star,
    Check
} from 'lucide-react'
import { PLANS } from '../constants/plans'

export default function LandingPage() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Romaneio<span className="text-blue-600">Rapido</span></span>
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex gap-6 text-[13px] font-medium text-gray-500">
                            <a href="#solucao" className="hover:text-gray-900 transition-colors">Solução</a>
                            <a href="#recursos" className="hover:text-gray-900 transition-colors">Recursos</a>
                            <a href="#contato" className="hover:text-gray-900 transition-colors">Contato</a>
                        </nav>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[13px] font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="h-9 px-5 text-[13px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Experimentar
                        </button>
                    </div>

                    <button className="md:hidden p-1.5 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-3">
                        <nav className="flex flex-col gap-3 text-sm font-medium text-gray-600">
                            <a href="#solucao" onClick={() => setIsMenuOpen(false)}>Solução</a>
                            <a href="#recursos" onClick={() => setIsMenuOpen(false)}>Recursos</a>
                            <a href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</a>
                        </nav>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => navigate('/login')} className="flex-1 h-10 text-sm font-medium border border-gray-200 rounded-lg text-gray-700">Login</button>
                            <button onClick={() => navigate('/login')} className="flex-1 h-10 text-sm font-semibold bg-blue-600 text-white rounded-lg">Experimentar</button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* Hero - Split Layout */}
                <section className="pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                            {/* Texto */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
                                    <Star className="w-3 h-3 fill-blue-600" />
                                    Sistema ERP para Estoque
                                </div>

                                <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-[1.15] mb-5 tracking-tight">
                                    Gerencie seu estoque
                                    <br />
                                    <span className="text-blue-600">sem complicação</span>
                                </h1>

                                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                                    Controle total do inventário com leitura de código de barras,
                                    interface rápida como planilha e relatórios em tempo real.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="h-12 px-7 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                    >
                                        Acessar Sistema <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <a
                                        href="#solucao"
                                        className="h-12 px-7 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Saiba mais
                                    </a>
                                </div>

                                <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> 100% Web
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Sem instalação
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Código de barras
                                    </span>
                                </div>
                            </div>

                            {/* Mockup Visual */}
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl -z-10"></div>
                                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden">
                                    {/* Mini header */}
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                            <Package className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">Dashboard</span>
                                        <div className="ml-auto flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 bg-gray-50/50">
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Produtos', value: '1.247', icon: Boxes, accent: 'text-blue-600 bg-blue-50' },
                                                { label: 'Hoje', value: '+38', icon: Truck, accent: 'text-emerald-600 bg-emerald-50' },
                                                { label: 'Alertas', value: '5', icon: BarChart3, accent: 'text-amber-600 bg-amber-50' },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                                                    <div className={`w-7 h-7 rounded-lg ${s.accent} flex items-center justify-center mb-2`}>
                                                        <s.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mini Table */}
                                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                                <span>Produto</span>
                                                <span>SKU</span>
                                                <span>Qtd</span>
                                                <span>Status</span>
                                            </div>
                                            {[
                                                { name: 'Action Hero Pro', sku: 'BRQ-001', qty: '45', s: 'ok' },
                                                { name: 'Quebra-Cabeça 500', sku: 'BRQ-042', qty: '8', s: 'low' },
                                                { name: 'Jogo Tabuleiro X', sku: 'JGS-019', qty: '120', s: 'ok' },
                                                { name: 'RC Drift Car', sku: 'BRQ-087', qty: '3', s: 'crit' },
                                            ].map((r, i) => (
                                                <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-gray-50 text-xs">
                                                    <span className="font-medium text-gray-800 truncate">{r.name}</span>
                                                    <span className="text-gray-400 font-mono text-[10px]">{r.sku}</span>
                                                    <span className="font-semibold text-gray-600">{r.qty}</span>
                                                    <span>
                                                        {r.s === 'ok' && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-semibold">OK</span>}
                                                        {r.s === 'low' && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-semibold">Baixo</span>}
                                                        {r.s === 'crit' && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-semibold">Crítico</span>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solução - Alternating Rows */}
                <section id="solucao" className="py-20 bg-gray-50/60">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Por que RomaneioRapido?</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Um sistema feito pra quem <span className="text-blue-600">não tem tempo a perder</span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: ScanBarcode,
                                    title: 'Leitura de Código de Barras',
                                    desc: 'Dê entrada e saída em produtos com um simples bip. Conecte qualquer leitor USB e pronto — sem configuração.',
                                    tag: 'Agilidade'
                                },
                                {
                                    icon: Boxes,
                                    title: 'Estoque em Tempo Real',
                                    desc: 'Veja a quantidade exata de cada produto, receba alertas de estoque baixo e nunca mais perca uma venda por falta de produto.',
                                    tag: 'Controle'
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Visão Completa do Negócio',
                                    desc: 'Dashboards visuais que mostram movimentações, tendências e saúde do estoque em uma interface limpa como planilha.',
                                    tag: 'Inteligência'
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-start gap-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.tag}</span>
                                        </div>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors hidden md:block mt-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recursos - Compact Grid */}
                <section id="recursos" className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Recursos</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Tudo incluso, sem surpresas</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { icon: ScanBarcode, title: 'Código de Barras', desc: 'Leitor USB integrado' },
                                { icon: ClipboardList, title: 'Cadastro Rápido', desc: 'Produtos em segundos' },
                                { icon: Truck, title: 'Movimentações', desc: 'Entrada e saída fácil' },
                                { icon: BarChart3, title: 'Relatórios', desc: 'Dados visuais e claros' },
                                { icon: Shield, title: 'Segurança', desc: 'Dados criptografados' },
                                { icon: Globe, title: 'Acesso Web', desc: 'Qualquer dispositivo' },
                                { icon: Zap, title: 'Performance', desc: 'Interface ultra-rápida' },
                                { icon: Boxes, title: 'Categorias', desc: 'Organize por setor' },
                                { icon: Star, title: 'Suporte', desc: 'Atendimento dedicado' },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    className="p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200 group"
                                >
                                    <r.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors mb-3" />
                                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{r.title}</h4>
                                    <p className="text-xs text-gray-400">{r.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Números */}
                <section className="py-16 bg-gray-50/60">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="grid grid-cols-3 gap-8 text-center">
                            {[
                                { value: '99.9%', label: 'Uptime garantido' },
                                { value: '<1s', label: 'Tempo de resposta' },
                                { value: '24/7', label: 'Sistema disponível' },
                            ].map((n, i) => (
                                <div key={i}>
                                    <p className="text-3xl md:text-4xl font-extrabold text-blue-600">{n.value}</p>
                                    <p className="text-sm text-gray-400 font-medium mt-1">{n.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Planos */}
                <section id="planos" className="py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Preços</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                                Escolha o plano ideal para você
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                Sem taxas escondidas. Cancele quando quiser ou comece com nosso teste limitado.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {PLANS.map((plan, i) => (
                                <div
                                    key={i}
                                    className={`relative p-8 rounded-[24px] border transition-all duration-300 ${plan.highlight
                                        ? 'border-blue-600 shadow-xl shadow-blue-600/10 scale-105 z-10 bg-white'
                                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                                        }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Mais Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">{plan.description}</p>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                        {plan.period && <span className="text-gray-400 font-medium">{plan.period}</span>}
                                    </div>

                                    <button
                                        onClick={() => navigate('/login')}
                                        className={`w-full py-4 rounded-[10px] font-bold text-sm transition-all duration-200 mb-8 ${plan.highlight
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                            : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        Começar Agora
                                    </button>

                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">O que está incluso:</p>
                                        {plan.features.map((feature, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-gray-600">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-white">
                    <div className="max-w-3xl mx-auto px-5 text-center">
                        <div className="bg-gray-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3"></div>

                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Comece a organizar seu estoque hoje
                                </h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm md:text-base">
                                    Simples, rápido e sem complicação. Seu inventário sob controle em minutos.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="h-12 px-8 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"
                                >
                                    Acessar o Sistema <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contato" className="border-t border-gray-100 py-12">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                                        <Package className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">RomaneioRapido</span>
                                </div>
                                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                                    Sistema de gestão de estoque para empresas que querem crescer com organização e eficiência.
                                </p>
                            </div>

                            <div className="flex gap-12">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Navegação</h4>
                                    <ul className="space-y-2 text-xs text-gray-400">
                                        <li><a href="#solucao" className="hover:text-gray-700 transition-colors">Solução</a></li>
                                        <li><a href="#recursos" className="hover:text-gray-700 transition-colors">Recursos</a></li>
                                        <li><button onClick={() => navigate('/login')} className="hover:text-gray-700 transition-colors">Entrar</button></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Contato</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>contato@romaneiorapido.com.br</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 text-[11px] text-gray-300 text-center">
                            © 2026 RomaneioRapido
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
