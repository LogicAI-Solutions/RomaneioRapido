import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingOverlay from '../components/LoadingOverlay'
import { Package, Eye, EyeOff, Loader2, ArrowLeft, Zap, BarChart3, ScanBarcode } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch {
            setError('Email ou senha incorretos')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50/30 font-sans selection:bg-brand-500/30">
            {isLoading && <LoadingOverlay message="Autenticando..." />}
            {/* Seção Esquerda - Marketing (Oculta em Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-20 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] -ml-64 -mb-64" />

                {/* Botão Voltar */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-sm font-bold w-fit group relative z-10 mb-16"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span>Voltar para o início</span>
                </button>

                {/* Conteúdo Central */}
                <div className="max-w-md relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
                        <Package className="w-8 h-8 text-brand-400" />
                    </div>
                    <h1 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                        Controle seu estoque com <span className="text-brand-400">velocidade</span> máxima.
                    </h1>
                    <p className="text-slate-400 text-lg mb-12 font-medium leading-relaxed">
                        Gerencie movimentações, organize categorias e acompanhe relatórios em tempo real com elegância e eficiência.
                    </p>

                    <div className="space-y-8">
                        {[
                            { icon: ScanBarcode, text: 'Leitura rápida de código de barras', color: 'text-brand-400' },
                            { icon: Zap, text: 'Interface ultra-rápida sem delay', color: 'text-amber-400' },
                            { icon: BarChart3, text: 'Dashboards visuais e inteligentes', color: 'text-emerald-400' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 text-slate-300">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group transition-all hover:bg-white/10">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <span className="text-base font-bold tracking-tight">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rodapé Visual */}
                <div className="flex items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10 mt-auto pt-10">
                    <span>© 2026 RomaneioRapido</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                    <span>Segurança Bancária</span>
                </div>
            </div>

            {/* Seção Direita - Formulário */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Mobile Header (Apenas em Mobile) */}
                <div className="lg:hidden p-6 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-slate-900 tracking-tight">Romaneio<span className="text-brand-600">Rapido</span></span>
                    </div>
                    <button onClick={() => navigate('/')} className="text-xs font-black text-brand-600 uppercase tracking-wider">
                        Voltar
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-slate-50/30">
                    <div className="w-full max-w-sm animate-slide-up">
                        {/* Boas vindas */}
                        <div className="mb-12 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Bem-vindo.</h2>
                            <p className="text-slate-500 font-semibold italic text-sm">Insira suas credenciais para acessar a plataforma.</p>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço de Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    required
                                    className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold text-sm shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                                    <button type="button" className="text-[11px] font-black text-brand-600 hover:text-brand-700 tracking-tight">Esqueceu a senha?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        required
                                        className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold text-sm pr-14 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-600 p-2 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm shadow-red-500/5">
                                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                                    <p className="text-xs text-red-600 font-black uppercase tracking-tight">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:shadow-brand-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-sm tracking-tight"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Autenticando...</span>
                                    </>
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </button>
                        </form>

                        <div className="mt-16 text-center">
                            <p className="text-xs text-slate-400 font-bold tracking-tight">
                                Não tem uma conta ainda? <button className="text-brand-600 font-black hover:underline px-1">Solicitar acesso ao Romaneio</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
