import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingOverlay from '../components/LoadingOverlay'
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
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState('')
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

                // Get all products sorted by most recent for filtering
                const sortedProducts = [...dbProducts].sort((a: any, b: any) => b.id - a.id)
                setAllProducts(sortedProducts)

            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const getStockStatus = (p: Product) => {
        if (p.stock_quantity <= 0) return { label: 'Esgotado', class: 'bg-red-50 text-red-600 border-red-100/50 shadow-sm shadow-red-500/5' }
        if (p.stock_quantity <= p.min_stock) return { label: 'Baixo', class: 'bg-orange-50 text-orange-600 border-orange-100/50 shadow-sm shadow-orange-500/5' }
        return { label: 'Estoque OK', class: 'bg-teal-50 text-teal-600 border-teal-100/50 shadow-sm shadow-teal-500/5' }
    }

    const displayProducts = searchQuery
        ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
        : allProducts.slice(0, 10)

    if (loading) {
        return (
            <>
                <LoadingOverlay message="Sincronizando Dados..." />
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                            <div className="h-4 w-64 bg-slate-100 rounded-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                    <div className="h-96 bg-white rounded-3xl border border-slate-100 shadow-sm" />
                </div>
            </>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm font-semibold text-slate-400">Bem-vindo de volta! Aqui está um resumo do seu estoque.</p>
                </div>
                <button
                    onClick={() => navigate('/produtos')}
                    className="h-12 px-6 font-bold bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Cadastrar Produto</span>
                </button>
            </div>

            {/* 3 Main Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shadow-sm ring-1 ring-brand-100/50">
                            <Boxes className="w-6 h-6 text-brand-600" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">
                        {stats.totalProducts}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Produtos Registrados</p>
                </div>

                <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shadow-sm ring-1 ring-brand-100/50">
                            <ArrowRightLeft className="w-6 h-6 text-brand-600" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">
                        {stats.todayMovements}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Movimentações Hoje</p>
                </div>

                <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shadow-sm ring-1 ring-orange-100/50">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">
                        {stats.lowStockCount}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas de Estoque</p>
                </div>
            </div>

            {/* Products Table Area */}
            <div className="glass-card rounded-[2rem] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Produtos Recentes</h2>
                    <div className="relative group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            placeholder="Buscar produto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-80 h-12 pl-12 pr-6 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all font-semibold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Produto</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">SKU</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Quantidade</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-sm font-bold text-slate-400 italic">
                                        Nenhum produto {searchQuery ? 'encontrado' : 'cadastrado ainda'}.
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map((p: Product) => {
                                    const status = getStockStatus(p)
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                        {p.image_base64 ? (
                                                            <img src={p.image_base64} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-mono text-xs font-bold text-slate-400">
                                                {p.sku || 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-baseline justify-end gap-1.5">
                                                    <span className="font-black text-slate-900">{p.stock_quantity % 1 === 0 ? p.stock_quantity : p.stock_quantity.toFixed(2)}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{p.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => navigate('/produtos')}
                                                    className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all inline-flex border border-transparent hover:border-brand-100"
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

                {allProducts.length > 0 && (
                    <div className="p-6 border-t border-slate-100/50 text-center bg-slate-50/20">
                        <button
                            onClick={() => navigate('/produtos')}
                            className="text-sm font-black text-brand-600 hover:text-brand-700 hover:underline transition-all tracking-tight"
                        >
                            Ver todos os produtos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
