import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingOverlay from '../components/LoadingOverlay'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Loader2, Tags, GripVertical, Check } from 'lucide-react'

interface Category {
    id: number
    name: string
    description: string | null
    position: number
}

export default function CategoriesPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [form, setForm] = useState({ name: '', description: '' })

    // Reorder state
    const [isReordering, setIsReordering] = useState(false)
    const [reorderList, setReorderList] = useState<Category[]>([])
    const [savingOrder, setSavingOrder] = useState(false)

    // Drag state
    const dragItem = useRef<number | null>(null)
    const dragOverItem = useRef<number | null>(null)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories/')
            setCategories(res.data)
        } catch (err) {
            console.error('Erro ao buscar categorias:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', description: '' })
        setModalOpen(true)
    }

    const openEdit = (c: Category) => {
        setEditing(c)
        setForm({ name: c.name, description: c.description || '' })
        setModalOpen(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = { name: form.name, description: form.description || null }
            if (editing) {
                await api.put(`/categories/${editing.id}`, payload)
            } else {
                await api.post('/categories/', payload)
            }
            setModalOpen(false)
            fetchCategories()
            toast.success('Categoria salva com sucesso!')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao salvar categoria')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/categories/${id}`)
            setDeleteConfirm(null)
            fetchCategories()
        } catch (err) {
            console.error('Erro ao deletar categoria:', err)
        }
    }

    // Reorder functions
    const startReorder = () => {
        setReorderList([...categories])
        setIsReordering(true)
    }

    const cancelReorder = () => {
        setReorderList([])
        setIsReordering(false)
        setDragIndex(null)
        setDragOverIndex(null)
    }

    const saveOrder = async () => {
        setSavingOrder(true)
        try {
            const items = reorderList.map((cat, i) => ({ id: cat.id, position: i }))
            await api.post('/categories/reorder', { items })
            setIsReordering(false)
            setReorderList([])
            fetchCategories()
            toast.success('Nova ordem salva com sucesso!')
        } catch (err) {
            console.error('Erro ao salvar ordem:', err)
            toast.error('Erro ao salvar a nova ordem')
        } finally {
            setSavingOrder(false)
        }
    }

    // Drag and Drop handlers
    const handleDragStart = (index: number) => {
        dragItem.current = index
        setDragIndex(index)
    }

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index
        setDragOverIndex(index)
    }

    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) {
            setDragIndex(null)
            setDragOverIndex(null)
            return
        }
        const newList = [...reorderList]
        const draggedItem = newList.splice(dragItem.current, 1)[0]
        newList.splice(dragOverItem.current, 0, draggedItem)
        setReorderList(newList)
        dragItem.current = null
        dragOverItem.current = null
        setDragIndex(null)
        setDragOverIndex(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const displayList = isReordering ? reorderList : categories

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Categorias</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{categories.length} categoria{categories.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    {!isReordering ? (
                        <>
                            {categories.length > 1 && (
                                <button
                                    onClick={startReorder}
                                    className="h-9 px-4 text-[13px] font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <GripVertical className="w-4 h-4" /> Reorganizar
                                </button>
                            )}
                            <button onClick={openCreate} className="h-9 px-4 text-[13px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Nova Categoria
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={cancelReorder}
                                className="h-9 px-4 text-[13px] font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                            <button
                                onClick={saveOrder}
                                disabled={savingOrder}
                                className="h-9 px-4 text-[13px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Salvar Ordem
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isReordering && (
                <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-700 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-amber-500" />
                    Arraste e solte as categorias para reorganizar. Clique em "Salvar Ordem" para confirmar.
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 relative min-h-[300px]">
                    <LoadingOverlay message="Buscando Categorias..." />
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin opacity-20" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20">
                    <Tags className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-400">Nenhuma categoria</p>
                    <p className="text-xs text-gray-300 mt-1">Crie categorias para organizar seus produtos</p>
                </div>
            ) : isReordering ? (
                /* Reorder Mode: Drag and Drop */
                <div className="space-y-2">
                    {displayList.map((c, index) => (
                        <div
                            key={c.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            className={`
                                bg-white rounded-xl border p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing select-none
                                transition-all duration-200
                                ${dragIndex === index ? 'opacity-40 scale-95 border-blue-300 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}
                                ${dragOverIndex === index && dragIndex !== index ? 'border-blue-400 border-2 bg-blue-50/30' : ''}
                            `}
                        >
                            <div className="text-gray-300 hover:text-gray-500 transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                                {index + 1}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Tags className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900">{c.name}</h3>
                                {c.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Normal Mode: Grid de cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayList.map(c => (
                        <div key={c.id} onClick={() => navigate(`/categorias/${c.id}`)} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Tags className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    {deleteConfirm === c.id ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleDelete(c.id)} className="px-2 py-1 text-[10px] font-bold bg-red-500 text-white rounded-md">Sim</button>
                                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] font-bold bg-gray-200 text-gray-600 rounded-md">Não</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">{c.name}</h3>
                            {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                            <p className="text-[10px] text-blue-500 font-medium mt-2">Clique para ver produtos →</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome *</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    placeholder="Ex: Brinquedos" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                                    placeholder="Descrição opcional..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-10 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-1 h-10 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editing ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
