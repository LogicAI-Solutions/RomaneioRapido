import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Plus, Boxes, ArrowRightLeft, AlertTriangle, Search, Pencil, Image as ImageIcon } from 'lucide-react'

interface Stats {
    totalProducts: number
    todayMovements: number
    lowStockCount: number
}

interface Product {
    id: number
    name: string
    sku: string | null
    stock_quantity: number
    min_stock: number
    unit: string
    image_base64: string | null
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<Stats>({ totalProducts: 0, todayMovements: 0, lowStockCount: 0 })
    const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [productsRes, movementsRes, stockLevelsRes] = await Promise.all([
                    api.get('/products/', { params: { per_page: 100 } }),
                    api.get('/inventory/movements'),
                    api.get('/inventory/stock-levels'),
                ])

                const dbProducts = productsRes.data.items || productsRes.data
                const numProducts = productsRes.data.total || dbProducts.length

                const allMovements = movementsRes.data || []
                const todayStr = new Date().toISOString().split('T')[0]
                const todayMovs = allMovements.filter((m: any) => m.created_at && m.created_at.startsWith(todayStr))

                const lowStockList = stockLevelsRes.data || []
                const lowStockFiltered = lowStockList.filter((s: any) => s.is_low_stock)

                setStats({
                    totalProducts: numProducts,
                    todayMovements: todayMovs.length,
                    lowStockCount: lowStockFiltered.length,
                })

                // Get 10 most recent products
                const sortedProducts = [...dbProducts].sort((a: any, b: any) => b.id - a.id).slice(0, 10)
                setRecentProducts(sortedProducts)

            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const getStockStatus = (p: Product) => {
        if (p.stock_quantity <= 0) return { label: 'Zerado', class: 'bg-red-50 text-red-600 border-red-100' }
        if (p.stock_quantity <= p.min_stock) return { label: 'Baixo', class: 'bg-amber-50 text-amber-600 border-amber-100' }
        return { label: 'Em Estoque', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Visão geral do seu estoque hoje.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/produtos')}
                        className="h-10 px-4 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Cadastrar Produto
                    </button>
                </div>
            </div>

            {/* 3 Main Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Boxes className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {loading ? '—' : stats.totalProducts}
                    </p>
                    <p className="text-sm font-semibold text-gray-400">Produtos Registrados</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                            <ArrowRightLeft className="w-5 h-5 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {loading ? '—' : stats.todayMovements}
                    </p>
                    <p className="text-sm font-semibold text-gray-400">Movimentações Hoje</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {loading ? '—' : stats.lowStockCount}
                    </p>
                    <p className="text-sm font-semibold text-gray-400">Alertas de Estoque</p>
                </div>
            </div>

            {/* Products Table Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-gray-900">Produtos Recentes</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            placeholder="Buscar produto..."
                            className="w-full sm:w-64 h-9 pl-9 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">QTD</th>
                                <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : recentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                        Nenhum produto cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                recentProducts.map((p) => {
                                    const status = getStockStatus(p)
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {p.image_base64 ? (
                                                            <img src={p.image_base64} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-gray-500">
                                                {p.sku || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="font-bold text-gray-900">{p.stock_quantity}</span>
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase">{p.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => navigate('/produtos')}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && recentProducts.length > 0 && (
                    <div className="p-4 border-t border-gray-100 text-center bg-gray-50/50">
                        <button
                            onClick={() => navigate('/produtos')}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Ver todos os produtos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
