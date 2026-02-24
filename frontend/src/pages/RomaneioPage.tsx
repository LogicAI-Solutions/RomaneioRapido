import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import {
    ScanBarcode,
    Plus,
    AlertTriangle,
    Camera,
    ShoppingCart,
    Trash2,
    CheckCircle2,
    UserCircle2
} from 'lucide-react'
import BarcodeScanner from '../components/BarcodeScanner'
import RomaneioExportModal from '../components/RomaneioExportModal'
import type { CartItem } from '../components/RomaneioExportModal'
import { isIntegerUnit } from '../utils/units'

interface Product {
    id: number
    name: string
    sku: string | null
    barcode: string | null
    stock_quantity: number
    min_stock: number
    unit: string
    price: number
}

interface ClientResult {
    id: number
    name: string
    document: string | null
    phone: string | null
}

interface StockLevel {
    product_id: number
    product_name: string
    barcode: string | null
    stock_quantity: number
    min_stock: number
    unit: string
    price: number
    is_low_stock: boolean
}

export default function RomaneioPage() {
    const [activeTab, setActiveTab] = useState<'romaneio' | 'movimentacoes' | 'estoque'>('romaneio')
    const [barcodeInput, setBarcodeInput] = useState('')

    // Novo Formato "Carrinho"
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [customerName, setCustomerName] = useState('')
    const [showExportModal, setShowExportModal] = useState(false)

    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [cameraOpen, setCameraOpen] = useState(false)

    // Busca de Produtos
    const [dropdownResults, setDropdownResults] = useState<Product[]>([])
    const [isSearchingText, setIsSearchingText] = useState(false)

    // Busca de Clientes
    const [dropdownClients, setDropdownClients] = useState<ClientResult[]>([])
    const [isSearchingClient, setIsSearchingClient] = useState(false)
    const [showClientDropdown, setShowClientDropdown] = useState(false)

    const [movements, setMovements] = useState<any[]>([])
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([])

    // Filtros e Paginação do Estoque
    const [estoqueSearch, setEstoqueSearch] = useState('')
    const [estoquePage, setEstoquePage] = useState(1)
    const ESTOQUE_PER_PAGE = 20

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
        if (activeTab === 'estoque') {
            setEstoquePage(1)
            setEstoqueSearch('')
            fetchStockLevels()
        }
    }, [activeTab])

    // Busca Esperta: Autocomplete em tempo real ao digitar
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (barcodeInput.trim().length >= 2) {
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
    }, [barcodeInput])

    // Busca Esperta para Clientes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (customerName.trim().length >= 2 && showClientDropdown) {
                setIsSearchingClient(true)
                try {
                    const res = await api.get('/clients/', { params: { search: customerName.trim(), limit: 5 } })
                    setDropdownClients(res.data)
                } catch {
                    setDropdownClients([])
                } finally {
                    setIsSearchingClient(false)
                }
            } else {
                setDropdownClients([])
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [customerName, showClientDropdown])

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

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [{ id: product.id, name: product.name, barcode: product.barcode, quantity: 1, unit: product.unit, price: product.price || 0 }, ...prev]
        })
    }

    const updateCartQuantity = (id: number, quant: string, unit: string) => {
        let val = parseFloat(quant)
        if (isNaN(val) || val < 0) return

        if (isIntegerUnit(unit)) {
            val = Math.floor(val)
        }

        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: val } : item))
    }

    const handleQuantityBlur = (id: number) => {
        setCartItems(prev => prev.filter(item => {
            if (item.id === id && (item.quantity <= 0 || isNaN(item.quantity))) {
                return false
            }
            return true
        }))
    }

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }

    const handleBarcodeScan = async (code: string) => {
        try {
            const res = await api.get(`/products/barcode/${code.trim()}`)
            if (res.data) {
                const productInfo = Array.isArray(res.data) ? res.data[0] : res.data
                addToCart(productInfo)
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
                addToCart(items[0])
                setCameraOpen(false)
                if (navigator.vibrate) navigator.vibrate(100)
            } else if (items.length > 1) {
                // Se encontrar múltiplos, vamos adicionar todos ao dropdown logic ou lidar com alert
                // No caso do romaneio a Busca Esperta já faz esse trabalho. 
                // Então apenas avisamos
                setCameraOpen(false)
                toast.error(`CÓDIGO LIDO: ${code}\nEncontramos múltiplos produtos para esta busca. Por favor, digite o nome no campo para escolher a variação correta.`, { duration: 6000 })
            } else {
                setCameraOpen(false)
                toast.error(`CÓDIGO LIDO: ${code}\nEste produto ainda não está cadastrado no sistema. Vá para a tela de 'Produtos' para criar o cadastro dele.`, { duration: 6000 })
            }
        } catch (error) {
            setCameraOpen(false)
            toast.error(`CÓDIGO LIDO: ${code}\nEste produto ainda não está cadastrado no sistema. Vá para a tela de 'Produtos' para criar o cadastro dele.`, { duration: 6000 })
        }
    }

    const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && barcodeInput.trim()) {
            handleBarcodeScan(barcodeInput)
            setBarcodeInput('')
            setDropdownResults([])
        }
    }

    const handleFinalizeRomaneio = async () => {
        if (cartItems.length === 0) return
        setSubmitting(true)

        try {
            // Envia cada item do carrinho como uma movimentação de SAÍDA individual
            // Ideal seria ter um endpoint em lote (bulk), mas aqui fazemos sequencialmente de forma simples.
            // Para sistemas em produção pesada, recomenda-se criar o endpoint bulk no backend.
            for (const item of cartItems) {
                await api.post('/inventory/movements', {
                    product_id: item.id,
                    quantity: item.quantity,
                    movement_type: 'OUT',
                    notes: customerName ? `Romaneio: ${customerName} ` : 'Romaneio Rápido',
                })
            }

            // Exibe modal de exportação ao invés de limpar a tela direto
            setShowExportModal(true)
            toast.success('Romaneio registrado com sucesso!')

        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao registrar movimentações do romaneio!')
        } finally {
            setSubmitting(false)
        }
    }

    const resetCart = () => {
        setCartItems([])
        setCustomerName('')
        setShowExportModal(false)
        setBarcodeInput('')
    }

    const filteredAndSortedStock = useMemo(() => {
        let result = stockLevels

        if (estoqueSearch.trim()) {
            const query = estoqueSearch.toLowerCase()
            result = result.filter(s =>
                s.product_name.toLowerCase().includes(query) ||
                (s.barcode && s.barcode.toLowerCase().includes(query))
            )
        }

        // Ordenar: primeiro o que está baixo, depois alfabético
        return result.sort((a, b) => {
            if (a.is_low_stock && !b.is_low_stock) return -1
            if (!a.is_low_stock && b.is_low_stock) return 1
            return a.product_name.localeCompare(b.product_name)
        })
    }, [stockLevels, estoqueSearch])

    const totalEstoquePages = Math.ceil(filteredAndSortedStock.length / ESTOQUE_PER_PAGE)
    const currentEstoqueItems = useMemo(() => {
        const start = (estoquePage - 1) * ESTOQUE_PER_PAGE
        return filteredAndSortedStock.slice(start, start + ESTOQUE_PER_PAGE)
    }, [filteredAndSortedStock, estoquePage])

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
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6">
                    {/* LEFTSIDE: BARCODE + CARRINHO */}
                    <div className="flex flex-col gap-6">

                        {/* Header do Romaneio */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-600" />
                                Montar Romaneio
                            </h2>

                            <div className="mb-4 relative">
                                <div className="flex justify-between items-end mb-1.5 ml-1">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Cliente / Destino</label>
                                    <button
                                        onClick={() => {
                                            setCustomerName('ROMANEIO/CONSUMIDOR')
                                            setShowClientDropdown(false)
                                        }}
                                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors uppercase tracking-wider"
                                    >
                                        + Consumidor Rápido
                                    </button>
                                </div>
                                <div className="relative">
                                    <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Busque cliente ou insira um nome livre..."
                                        value={customerName}
                                        onChange={(e) => {
                                            setCustomerName(e.target.value)
                                            setShowClientDropdown(true)
                                        }}
                                        onFocus={() => {
                                            if (customerName.trim().length >= 2) setShowClientDropdown(true)
                                        }}
                                        onBlur={() => {
                                            // Delay para permitir o clique no dropdown
                                            setTimeout(() => setShowClientDropdown(false), 200)
                                        }}
                                        className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-400 text-gray-900 font-semibold"
                                    />

                                    {/* Dropdown de Clientes */}
                                    {showClientDropdown && (dropdownClients.length > 0 || isSearchingClient) && customerName.trim().length >= 2 && (
                                        <div className="absolute z-40 top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                            {isSearchingClient ? (
                                                <div className="p-4 text-center text-sm text-gray-400 font-medium animate-pulse">Buscando clientes...</div>
                                            ) : dropdownClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        const docInfo = c.document ? ` - CPF/CNPJ: ${c.document}` : ''
                                                        setCustomerName(`${c.name}${docInfo}`)
                                                        setShowClientDropdown(false)
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col"
                                                >
                                                    <span className="text-sm font-bold text-gray-900">{c.name}</span>
                                                    {c.document && <span className="text-[10px] text-gray-400 font-mono mt-0.5">{c.document}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Barcode Input */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Adicionar Produto</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="Bipe o código ou digite o nome..."
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            onKeyDown={handleBarcodeKeyDown}
                                            autoFocus
                                            className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-400 font-medium"
                                        />

                                        {/* Dropdown de Busca Esperta */}
                                        {(dropdownResults.length > 0 || isSearchingText) && barcodeInput.trim().length >= 2 && (
                                            <div className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                                {isSearchingText ? (
                                                    <div className="p-4 text-center text-sm text-gray-400 font-medium animate-pulse">Buscando produto...</div>
                                                ) : dropdownResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            addToCart(p)
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
                            </div>
                        </div>

                        {/* LISTA DE ITENS DO ROMANEIO */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1 min-h-[300px]">
                            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                                    Itens do Romaneio
                                </span>
                                {cartItems.length > 0 && (
                                    <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
                                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                                    </span>
                                )}
                            </h2>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl h-full flex flex-col items-center justify-center">
                                    <ScanBarcode className="w-10 h-10 text-gray-200 mb-3" />
                                    <p className="text-sm font-semibold text-gray-400">Carrinho Vazio</p>
                                    <p className="text-xs text-gray-300 mt-1 max-w-[200px]">Bipe os produtos para adicioná-Layout listalos ao romaneio de saída.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {cartItems.map((item, idx) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all group animate-in slide-in-from-left-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3 ml-7 mt-0.5">
                                                    <p className="text-[10px] text-gray-400 font-mono">{item.barcode || 'Sem código'}</p>
                                                    <span className="text-[10px] text-gray-300">|</span>
                                                    <p className="text-xs font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-3 ml-7 sm:ml-0">
                                                <div className="text-right hidden sm:block w-24">
                                                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Subtotal</p>
                                                    <p className="text-sm font-black text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                                </div>

                                                {/* Controle de Quantidade */}
                                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step={isIntegerUnit(item.unit) ? "1" : "0.01"}
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item.id, e.target.value, item.unit)}
                                                        onBlur={() => handleQuantityBlur(item.id)}
                                                        className="w-16 h-7 text-center text-sm font-bold text-gray-900 border-none focus:ring-0 bg-transparent"
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-400 pr-2 uppercase">{item.unit}</span>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHTSIDE: RESUMO E FINALIZAÇÃO */}
                    <div className="flex flex-col h-full">
                        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl sticky top-24">
                            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                Resumo do Romaneio
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                    <span className="text-sm text-slate-400">Cliente/Destino</span>
                                    <span className="text-sm font-semibold text-white truncate max-w-[150px]" title={customerName}>{customerName || <span className="text-slate-500 italic">Não informado</span>}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                    <span className="text-sm text-slate-400">Total de Linhas</span>
                                    <span className="text-sm font-bold text-white">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                    <span className="text-sm text-slate-400">Total de Peças (Qtd)</span>
                                    <span className="text-lg font-bold text-slate-300">
                                        {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                    <span className="text-sm font-bold text-slate-300">Valor Total Estimado</span>
                                    <span className="text-xl font-black text-emerald-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0))}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinalizeRomaneio}
                                disabled={submitting || cartItems.length === 0}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[15px] font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Registrando BD...' : 'Finalizar Romaneio (Saída)'}
                            </button>
                            {cartItems.length > 0 && (
                                <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
                                    Ao clicar em finalizar, o estoque de todos os {cartItems.length} itens será <strong className="text-slate-300">reduzido</strong> imediatamente.
                                </p>
                            )}
                        </div>
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
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <input
                                type="text"
                                placeholder="Buscar no estoque por nome ou código..."
                                value={estoqueSearch}
                                onChange={(e) => {
                                    setEstoqueSearch(e.target.value)
                                    setEstoquePage(1)
                                }}
                                className="w-full h-10 pl-4 pr-10 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-400 font-medium shadow-sm"
                            />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            {filteredAndSortedStock.length} {filteredAndSortedStock.length === 1 ? 'resultado' : 'resultados'}
                        </span>
                    </div>

                    <div className="overflow-y-auto flex-1 relative">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur shadow-sm z-10">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estoque Atual</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mínimo</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400 italic">Carregando...</td></tr>
                                ) : currentEstoqueItems.length === 0 ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400 italic">Nenhum dado de estoque encontrado</td></tr>
                                ) : (
                                    currentEstoqueItems.map((s) => (
                                        <tr key={s.product_id} className="hover:bg-gray-50/50 transition-colors group">
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
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => {
                                                        addToCart({
                                                            id: s.product_id,
                                                            name: s.product_name,
                                                            barcode: s.barcode,
                                                            stock_quantity: s.stock_quantity,
                                                            min_stock: s.min_stock,
                                                            unit: s.unit,
                                                            price: s.price,
                                                            sku: null
                                                        })
                                                        // Opcional: Feedback visual ao clicar
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto"
                                                    title="Adicionar ao Romaneio"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Romaneio
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {totalEstoquePages > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">
                                Página <strong className="text-gray-900">{estoquePage}</strong> de {totalEstoquePages}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setEstoquePage(p => Math.max(1, p - 1))}
                                    disabled={estoquePage === 1}
                                    className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-600 font-semibold disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setEstoquePage(p => Math.min(totalEstoquePages, p + 1))}
                                    disabled={estoquePage === totalEstoquePages}
                                    className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-600 font-semibold disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Camera Scanner */}
            {cameraOpen && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setCameraOpen(false)}
                />
            )}

            {showExportModal && (
                <RomaneioExportModal
                    customerName={customerName}
                    items={cartItems}
                    onClose={resetCart}
                />
            )}
        </div>
    )
}
