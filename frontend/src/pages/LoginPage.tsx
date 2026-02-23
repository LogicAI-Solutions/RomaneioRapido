import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Zap, BarChart3, ScanBarcode } from 'lucide-react'

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
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Seção Esquerda - Marketing (Oculta em Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 relative flex-col justify-between p-16">
                {/* Botão Voltar */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar para o início
                </button>

                {/* Conteúdo Central */}
                <div className="max-w-md">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                        Controle seu estoque com a velocidade que seu negócio exige.
                    </h1>
                    <p className="text-blue-100/70 text-lg mb-12">
                        Gerencie movimentações, organize categorias e acompanhe relatórios em tempo real em uma única plataforma.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: ScanBarcode, text: 'Leitura rápida de código de barras' },
                            { icon: Zap, text: 'Interface ultra-rápida sem delay' },
                            { icon: BarChart3, text: 'Dashboards visuais e inteligentes' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-white">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <item.icon className="w-5 h-5 text-blue-300" />
                                </div>
                                <span className="text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rodapé Visual */}
                <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
                    <span>© 2026 RomaneioRapido</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>Segurança Garantida</span>
                </div>
            </div>

            {/* Seção Direita - Formulário */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header (Apenas em Mobile) */}
                <div className="lg:hidden p-6 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">RomaneioRapido</span>
                    </div>
                    <button onClick={() => navigate('/')} className="text-xs font-semibold text-blue-600">
                        Sair
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-20">
                    <div className="w-full max-w-sm">
                        {/* Boas vindas */}
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Acesse sua conta</h2>
                            <p className="text-gray-500 text-sm">Insira suas credenciais para gerenciar seu estoque.</p>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-700 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    required
                                    className="w-full h-[54px] px-5 bg-white border border-gray-200 rounded-[10px] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[13px] font-bold text-gray-700">Senha</label>
                                    <button type="button" className="text-[11px] font-bold text-blue-600 hover:underline">Esqueceu a senha?</button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        required
                                        className="w-full h-[54px] px-5 bg-white border border-gray-200 rounded-[10px] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-sm pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-[10px] flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                                    <p className="text-sm text-red-600 font-bold">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[54px] bg-blue-600 text-white font-bold rounded-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Autenticando...
                                    </>
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-xs text-gray-400 font-medium">
                                Não tem uma conta? <button className="text-blue-600 font-bold hover:underline">Solicitar acesso</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
