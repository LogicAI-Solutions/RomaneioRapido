import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import api from '../services/api'
import LoadingOverlay from '../components/LoadingOverlay'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Search, Users, Phone, Mail } from 'lucide-react'

interface Client {
    id: number
    name: string
    phone: string | null
    document: string | null
    email: string | null
    notes: string | null
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Client | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [form, setForm] = useState({
        name: '',
        phone: '',
        document: '',
        email: '',
        notes: ''
    })

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients/', { params: { search: searchQuery } })
            setClients(res.data)
        } catch (err) {
            console.error('Erro ao buscar clientes:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchClients()
        }, 300)
        return () => clearTimeout(delaySearch)
    }, [searchQuery])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', phone: '', document: '', email: '', notes: '' })
        setModalOpen(true)
    }

    const openEdit = (c: Client) => {
        setEditing(c)
        setForm({
            name: c.name,
            phone: c.phone || '',
            document: c.document || '',
            email: c.email || '',
            notes: c.notes || ''
        })
        setModalOpen(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                name: form.name,
                phone: form.phone || null,
                document: form.document || null,
                email: form.email || null,
                notes: form.notes || null,
            }
            if (editing) {
                await api.put(`/clients/${editing.id}`, payload)
            } else {
                await api.post('/clients/', payload)
            }
            setModalOpen(false)
            fetchClients()
            toast.success('Cliente salvo com sucesso!')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao salvar cliente')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/clients/${id}`)
            setDeleteConfirm(null)
            fetchClients()
            toast.success('Cliente excluído com sucesso!')
        } catch (err) {
            console.error('Erro ao deletar cliente:', err)
            toast.error('Erro ao excluir cliente')
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {loading && <LoadingOverlay message="Carregando clientes..." />}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-brand-600" />
                        Gerenciar Clientes
                    </h1>
                    <p className="text-sm font-semibold text-slate-400">Cadastre e organize seus clientes para emiti-los no romaneio.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-12 pl-12 pr-4 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 font-semibold shadow-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={openCreate}
                        className="h-12 px-6 font-bold bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group shrink-0 active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Novo Cliente</span>
                    </button>
                </div>
            </div>

            {/* LIST */}
            <div className="glass-card rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Documento</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Contato</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Observação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-sm font-bold text-slate-400 italic">
                                        Nenhum cliente {searchQuery ? 'encontrado' : 'cadastrado'}.
                                    </td>
                                </tr>
                            ) : (
                                clients.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{c.name}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-mono text-xs font-bold text-slate-500">{c.document || '—'}</p>
                                        </td>
                                        <td className="px-8 py-5 space-y-1">
                                            {c.phone && (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                    <Phone className="w-3 h-3 text-brand-400" />
                                                    {c.phone}
                                                </div>
                                            )}
                                            {c.email && (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                    <Mail className="w-3 h-3 text-brand-400" />
                                                    {c.email}
                                                </div>
                                            )}
                                            {!c.phone && !c.email && <span className="text-slate-300 text-xs italic">—</span>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs text-slate-500 italic truncate max-w-[200px]">{c.notes || '—'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 relative">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-transparent hover:border-brand-100"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>

                                                {deleteConfirm === c.id ? (
                                                    <div className="absolute right-0 flex items-center bg-white shadow-xl border border-red-100 rounded-xl p-1 z-10 animate-in zoom-in-95 origin-right">
                                                        <span className="text-[10px] font-black px-3 text-red-500 uppercase tracking-wider">Confirmar?</span>
                                                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-xs px-3">Sim</button>
                                                        <button onClick={() => setDeleteConfirm(null)} className="p-2 ml-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(c.id)}
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CRIAR/EDITAR */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !saving && setModalOpen(false)} />

                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 shadow-brand-900/20">
                        <div className="px-8 py-6 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {editing ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button
                                onClick={() => !saving && setModalOpen(false)}
                                className="p-2 text-slate-400 hover:bg-white hover:text-slate-700 rounded-xl transition-all hover:shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
                                        Nome do Cliente *
                                    </label>
                                    <input
                                        required
                                        autoFocus
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full h-12 px-4 text-sm font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all placeholder-slate-400"
                                        placeholder="Ex: João da Silva / Loja do Centro"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
                                            CPF / CNPJ
                                        </label>
                                        <input
                                            value={form.document}
                                            onChange={e => setForm({ ...form, document: e.target.value })}
                                            className="w-full h-12 px-4 text-sm font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all placeholder-slate-400"
                                            placeholder="Apenas números"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
                                            Telefone / WhatsApp
                                        </label>
                                        <input
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="w-full h-12 px-4 text-sm font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full h-12 px-4 text-sm font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all placeholder-slate-400"
                                        placeholder="contato@cliente.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
                                        Observações
                                    </label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        className="w-full p-4 text-sm font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all placeholder-slate-400 min-h-[100px] resize-y"
                                        placeholder="Endereço de entrega, referências, etc."
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !form.name.trim()}
                                    className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
                                >
                                    {saving ? 'Salvando...' : 'Salvar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
