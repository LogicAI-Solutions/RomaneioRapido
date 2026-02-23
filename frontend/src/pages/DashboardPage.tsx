import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Boxes, Tags, ArrowRightLeft, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'

interface Stats {
    totalProducts: number
    totalCategories: number
    totalMovements: number
    lowStockCount: number
}

export default function DashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalCategories: 0, totalMovements: 0, lowStockCount: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [products, categories, movements, stockLevels] = await Promise.all([
                    api.get('/products/'),
                    api.get('/categories/'),
                    api.get('/inventory/movements'),
                    api.get('/inventory/stock-levels'),
                ])
                setStats({
                    totalProducts: products.data.length,
                    totalCategories: categories.data.length,
                    totalMovements: movements.data.length,
                    lowStockCount: stockLevels.data.filter((s: any) => s.is_low_stock).length,
                })
            } catch (err) {
                console.error('Erro ao buscar stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const cards = [
        { title: 'Produtos', value: stats.totalProducts, icon: Boxes, color: 'text-blue-600 bg-blue-50', link: '/produtos' },
        { title: 'Categorias', value: stats.totalCategories, icon: Tags, color: 'text-emerald-600 bg-emerald-50', link: '/categorias' },
        { title: 'Movimentações', value: stats.totalMovements, icon: ArrowRightLeft, color: 'text-violet-600 bg-violet-50', link: '/romaneio' },
        { title: 'Estoque Baixo', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', link: '/romaneio' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900">
                    Olá, {user?.full_name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Resumo do seu estoque</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => navigate(card.link)}
                        className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {loading ? '—' : card.value}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{card.title}</p>
                    </button>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        onClick={() => navigate('/produtos')}
                        className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-left hover:bg-blue-50 transition-colors"
                    >
                        <Boxes className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-800">Cadastrar Produto</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Adicione novos itens ao estoque</p>
                    </button>
                    <button
                        onClick={() => navigate('/romaneio')}
                        className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left hover:bg-emerald-50 transition-colors"
                    >
                        <ArrowRightLeft className="w-5 h-5 text-emerald-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-800">Novo Romaneio</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Registre entradas e saídas</p>
                    </button>
                    <button
                        onClick={() => navigate('/categorias')}
                        className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 text-left hover:bg-violet-50 transition-colors"
                    >
                        <Tags className="w-5 h-5 text-violet-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-800">Gerenciar Categorias</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Organize seus produtos</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
