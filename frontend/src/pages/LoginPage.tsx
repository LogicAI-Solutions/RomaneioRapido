import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react'

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-50/50 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card principal */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60 p-10">
                    {/* Logo e título */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-5">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                            RomaneioRapido
                        </h1>
                        <p className="text-sm text-gray-400 mt-1.5 font-medium">
                            Gestão de Estoque Inteligente
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
                            />
                        </div>

                        {/* Senha */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50/80 border border-red-100 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>

                {/* Rodapé */}
                <p className="text-center text-xs text-gray-300 mt-8 font-medium">
                    © 2026 RomaneioRapido
                </p>
            </div>
        </div>
    )
}
