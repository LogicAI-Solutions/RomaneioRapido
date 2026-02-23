import { useState, useEffect } from 'react'
import api from '../services/api'
import {
    ScanBarcode,
    ArrowUpFromLine,
    History,
    Plus,
    X,
    AlertTriangle,
    Camera
} from 'lucide-react'
import BarcodeScanner from '../components/BarcodeScanner'

interface Product {
    id: number
    name: string
    sku: string | null
    barcode: string | null
    stock_quantity: number
    min_stock: number
    unit: string
}

interface StockLevel {
    product_id: number
    product_name: string
    barcode: string | null
    stock_quantity: number
    min_stock: number
    unit: string
    is_low_stock: boolean
}

export default function RomaneioPage() {
    const [activeTab, setActiveTab] = useState<'romaneio' | 'movimentacoes' | 'estoque'>('romaneio')
    const [barcodeInput, setBarcodeInput] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [movementType] = useState<'IN' | 'OUT'>('OUT')
    const [quantity, setQuantity] = useState('1')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [showSearch, setShowSearch] = useState(false)
    const [cameraOpen, setCameraOpen] = useState(false)
    const [dropdownResults, setDropdownResults] = useState<Product[]>([])
    const [isSearchingText, setIsSearchingText] = useState(false)
    const [lastMovements, setLastMovements] = useState<Array<{ product: string, type: string, qty: number, time: string, unit: string }>>([])
    const [movements, setMovements] = useState<any[]>([])
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([])

    // fetchProducts foi removido pois a busca agora acontece via Busca Esperta (autocomplete)

    const fetchMovements = async () => {
        setLoading(true)
        try {
            const res = await api.get('/inventory/movements')
            setMovements(res.data)
        } catch (err) {
            console.error('Erro ao buscar movimentações:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStockLevels = async () => {
        setLoading(true)
        try {
            const res = await api.get('/inventory/stock-levels')
            setStockLevels(res.data)
        } catch (err) {
            console.error('Erro ao buscar níveis de estoque:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'movimentacoes') fetchMovements()
        if (activeTab === 'estoque') fetchStockLevels()
    }, [activeTab])

    // Busca Esperta: Autocomplete em tempo real ao digitar
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (barcodeInput.trim().length >= 2 && !selectedProduct) {
                setIsSearchingText(true)
                try {
                    const res = await api.get('/products/', { params: { search: barcodeInput.trim() } })
                    setDropdownResults(res.data.items || res.data)
                } catch {
                    setDropdownResults([])
                } finally {
                    setIsSearchingText(false)
                }
            } else {
                setDropdownResults([])
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [barcodeInput, selectedProduct])

    // Suporte para Scanner USB (Bip) Global
    useEffect(() => {
        let buffer = ''
        let lastKeyTime = Date.now()

        const handleKeyDown = (e: KeyboardEvent) => {
            // Se o usuário estiver digitando em um input de notas, ignoramos o listener global
            if (e.target instanceof HTMLInputElement && e.target.type !== 'text') return
            if (e.target instanceof HTMLTextAreaElement) return

            const currentTime = Date.now()

            // Scanners USB digitam muito rápido. Se passar de 50ms entre teclas, provavelmente é humano.
            if (currentTime - lastKeyTime > 50) {
                buffer = ''
            }

            if (e.key === 'Enter') {
                if (buffer.length > 3) {
                    handleBarcodeScan(buffer)
                    buffer = ''
                }
            } else if (e.key.length === 1) {
                buffer += e.key
            }

            lastKeyTime = currentTime
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleBarcodeScan = async (code: string) => {
        try {
            const res = await api.get(`/products/barcode/${code.trim()}`)
            if (res.data) {
                const productInfo = Array.isArray(res.data) ? res.data[0] : res.data
                setSelectedProduct(productInfo)
                setShowSearch(false)
                setCameraOpen(false)

                // Haptic feedback (vibração leve) para USB também
                if (navigator.vibrate) navigator.vibrate(100)
                return
            }
        } catch {
            // Ignora o erro da busca por barcode e tenta pesquisa por texto
        }

        try {
            const res = await api.get('/products/', { params: { search: code.trim() } })
            const items = res.data.items || res.data
            if (items.length === 1) {
                setSelectedProduct(items[0])
                setShowSearch(false)
                setCameraOpen(false)
                if (navigator.vibrate) navigator.vibrate(100)
            } else if (items.length > 1) {
                setSearchResults(items)
                setShowSearch(true)
                setCameraOpen(false)
                if (navigator.vibrate) navigator.vibrate(100)
            } else {
                setCameraOpen(false)
                window.alert(`CÓDIGO LIDO: ${code}\n\nEste produto ainda não está cadastrado no sistema.\nVá para a tela de 'Produtos' para criar o cadastro dele.`)
            }
        } catch (error) {
            setCameraOpen(false)
            window.alert(`CÓDIGO LIDO: ${code}\n\nEste produto ainda não está cadastrado no sistema.\nVá para a tela de 'Produtos' para criar o cadastro dele.`)
        }
    }

    const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && barcodeInput.trim()) {
            handleBarcodeScan(barcodeInput)
            setBarcodeInput('')
            setDropdownResults([])
        }
    }

    const handleMovementSubmit = async () => {
        if (!selectedProduct) return
        setSubmitting(true)
        try {
            await api.post('/inventory/movements', {
                product_id: selectedProduct.id,
                quantity: parseFloat(quantity),
                movement_type: movementType,
                notes: notes || null,
            })

            setLastMovements(prev => [{
                product: selectedProduct.name,
                type: movementType,
                qty: parseFloat(quantity),
                unit: selectedProduct.unit,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }, ...prev].slice(0, 10))

            setSelectedProduct(null)
            setQuantity('1')
            setNotes('')
            setBarcodeInput('')
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Erro ao registrar movimentação')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Romaneio</h1>
                <p className="text-sm text-gray-400 mt-0.5">Gestão de estoque e movimentações</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm max-w-fit">
                <button
                    onClick={() => setActiveTab('romaneio')}
                    className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'romaneio' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Romaneio
                </button>
                <button
                    onClick={() => setActiveTab('movimentacoes')}
                    className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'movimentacoes' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Movimentações
                </button>
                <button
                    onClick={() => setActiveTab('estoque')}
                    className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'estoque' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Estoque
                </button>
            </div>

            {activeTab === 'romaneio' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scan Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-blue-600" />
                            Nova Movimentação
                        </h2>

                        {/* Barcode Input */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="Bip do código ou digite o nome do produto..."
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={handleBarcodeKeyDown}
                                    autoFocus
                                    className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-300 font-medium"
                                />

                                {/* Dropdown de Busca Esperta */}
                                {(dropdownResults.length > 0 || isSearchingText) && !selectedProduct && barcodeInput.trim().length >= 2 && (
                                    <div className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                        {isSearchingText ? (
                                            <div className="p-4 text-center text-sm text-gray-400 font-medium animate-pulse">Buscando produto...</div>
                                        ) : dropdownResults.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProduct(p)
                                                    setBarcodeInput('')
                                                    setDropdownResults([])
                                                }}
                                                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between"
                                            >
                                                <div className="min-w-0 pr-4">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono truncate">{p.barcode || p.sku || 'Sem Cód.'}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-bold text-gray-700">{p.stock_quantity}</p>
                                                    <p className="text-[10px] text-gray-300 font-medium uppercase">{p.unit}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setCameraOpen(true)}
                                className="h-11 px-3 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 rounded-xl transition-all flex items-center justify-center shrink-0"
                                title="Usar câmera"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Selected Product Form */}
                        {selectedProduct ? (
                            <div className="bg-blue-50/30 rounded-xl border border-blue-100 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-bold text-blue-900">{selectedProduct.name}</p>
                                    <button onClick={() => setSelectedProduct(null)} className="p-1 text-blue-400 hover:text-blue-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mb-3">
                                    Estoque atual: <span className="font-bold text-gray-800">{selectedProduct.stock_quantity} {selectedProduct.unit}</span>
                                </p>

                                {/* Tipo (Apenas Saída no Romaneio) */}
                                <div className="flex gap-2 mb-3">
                                    <div className="w-full h-9 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all bg-red-500 text-white shadow-sm cursor-default">
                                        <ArrowUpFromLine className="w-3.5 h-3.5" /> Saída (Despacho / Romaneio)
                                    </div>
                                </div>

                                {/* Quantidade + Obs */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="col-span-2 relative">
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Quantidade</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step={selectedProduct.unit === 'UN' ? '1' : '0.01'}
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full h-9 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                                {selectedProduct.unit}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Observação</label>
                                        <input
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Opcional..."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleMovementSubmit}
                                    disabled={submitting || !quantity || parseFloat(quantity) <= 0}
                                    className="w-full h-10 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {submitting ? 'Salvando...' : 'Confirmar'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                <ScanBarcode className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Bipe um produto para começar</p>
                            </div>
                        )}
                    </div>

                    {/* Recent movements */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-violet-600" />
                            Recém Adicionados
                        </h2>
                        {lastMovements.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-xs text-gray-300 font-medium italic">Nenhuma movimentação recente</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lastMovements.map((m, i) => {
                                    const t = m.type === 'IN' ? { label: 'Entrada', class: 'bg-emerald-50 text-emerald-600' } : { label: 'Saída', class: 'bg-red-50 text-red-600' }
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                            <div className={`w-2 h-2 rounded-full ${m.type === 'IN' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{m.product}</p>
                                                <p className="text-[10px] text-gray-400">{t.label} · Qtd: {m.qty} {m.unit}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-mono flex-shrink-0">{m.time}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'movimentacoes' && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Qtd</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Observação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 italic">Carregando...</td></tr>
                                ) : movements.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 italic">Nenhuma movimentação registrada</td></tr>
                                ) : (
                                    movements.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{m.product?.name || 'Produto Excluído'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.movement_type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {m.movement_type === 'IN' ? 'ENTRADA' : 'SAÍDA'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-700">{m.quantity}</td>
                                            <td className="px-4 py-3 text-gray-400 text-xs italic">{m.notes || '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'estoque' && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estoque Atual</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mínimo</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 italic">Carregando...</td></tr>
                                ) : stockLevels.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 italic">Nenhum dado de estoque</td></tr>
                                ) : (
                                    stockLevels.map((s) => (
                                        <tr key={s.product_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{s.product_name}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-400">{s.barcode || '—'}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                {s.stock_quantity} <span className="text-[10px] text-gray-400 uppercase">{s.unit}</span>
                                                {s.is_low_stock && <AlertTriangle className="w-3 h-3 text-amber-500 inline ml-1" />}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-400">{s.min_stock}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_low_stock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {s.is_low_stock ? 'BAIXO' : 'OK'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de busca quando múltiplos resultados */}
            {showSearch && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSearch(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900">Selecione o Produto</h2>
                            <button onClick={() => setShowSearch(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {searchResults.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedProduct(p)
                                        setShowSearch(false)
                                    }}
                                    className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between border border-transparent hover:border-gray-100"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{p.barcode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-700">{p.stock_quantity}</p>
                                        <p className="text-[10px] text-gray-300 font-medium uppercase">{p.unit}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Scanner */}
            {cameraOpen && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setCameraOpen(false)}
                />
            )}
        </div>
    )
}
