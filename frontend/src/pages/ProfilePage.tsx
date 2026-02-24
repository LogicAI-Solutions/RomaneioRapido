import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import {
    Camera,
    Loader2,
    User as UserIcon,
    Crown,
    ShieldCheck,
    CreditCard,
    Check,
    AlertCircle
} from 'lucide-react'
import ImageCropper from '../components/ImageCropper'
import { PLANS } from '../constants/plans'
import LoadingOverlay from '../components/LoadingOverlay'

export default function ProfilePage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'general' | 'subscription' | 'security'>('general')

    const [saving, setSaving] = useState(false)
    const [isLoadingUsage, setIsLoadingUsage] = useState(false)
    const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [usage, setUsage] = useState({
        products: { used: 0, limit: 10 },
        categories: { used: 0, limit: 2 },
        plan_id: user?.plan_id || 'free'
    })

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        store_name: '',
        photo_base64: '',
        password: '',
        confirm_password: ''
    })

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                store_name: user.store_name || '',
                photo_base64: user.photo_base64 || ''
            }))
            setImagePreview(user.photo_base64 || null)
        }
    }, [user])

    const fetchUsageData = async () => {
        setIsLoadingUsage(true)
        try {
            const res = await api.get('/plans/usage')
            setUsage(res.data)
        } catch (err) {
            console.error('Erro ao buscar uso dos planos:', err)
        } finally {
            setIsLoadingUsage(false)
        }
    }

    useEffect(() => {
        fetchUsageData()
    }, [])

    useEffect(() => {
        if (activeTab === 'subscription') {
            fetchUsageData()
        }
    }, [activeTab])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = () => {
                setCropImageSrc(reader.result as string)
            }
            reader.readAsDataURL(file)
            e.target.value = ''
        }
    }

    const handleCropComplete = (blob: Blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setForm(prev => ({ ...prev, photo_base64: base64String }))
            setImagePreview(base64String)
        }
        reader.readAsDataURL(blob)
        setCropImageSrc(null)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (activeTab === 'security' && form.password && form.password !== form.confirm_password) {
            toast.error('As senhas não coincidem.')
            return
        }

        setSaving(true)
        try {
            const payload: any = {
                full_name: form.full_name,
                email: form.email,
                phone: form.phone || null,
                store_name: form.store_name || null,
                photo_base64: form.photo_base64 || null
            }

            if (form.password) {
                payload.password = form.password
            }

            await api.put('/auth/me', payload)
            toast.success('Perfil atualizado com sucesso!')

            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao atualizar perfil')
        } finally {
            setSaving(false)
        }
    }

    const handleSubscribe = async (planId: string) => {
        if (planId === user?.plan_id) return
        setIsSubscribing(planId)
        try {
            await api.patch('/plans/subscribe', { plan_id: planId })
            toast.success('Plano atualizado com sucesso!')
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao atualizar assinatura')
        } finally {
            setIsSubscribing(null)
        }
    }

    const calculateProgress = (used: number, limit: number) => {
        if (limit >= 999999) return 0
        return Math.min((used / limit) * 100, 100)
    }

    const currentPlan = PLANS.find(p => p.id === (user?.plan_id || usage.plan_id)) || PLANS[0]
    const effectivePlanId = user?.plan_id === 'enterprise' ? 'pro' : (user?.plan_id || 'free');

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6">

            <div className="pt-8 pb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Gerencie seu perfil e assinatura</p>
            </div>

            {/* Segmented Control (Apple Style) */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-10 w-fit">
                {(['general', 'subscription', 'security'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab === 'general' && <UserIcon className="w-4 h-4" />}
                        {tab === 'subscription' && <Crown className="w-4 h-4" />}
                        {tab === 'security' && <ShieldCheck className="w-4 h-4" />}
                        {tab === 'general' ? 'Geral' : tab === 'subscription' ? 'Assinatura' : 'Segurança'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 sm:p-12">
                    {activeTab === 'general' && (
                        <div className="animate-in fade-in duration-500">

                            {/* Profile Header (Avatar + Name) */}
                            <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-md">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        ) : (
                                            <span className="text-4xl font-bold text-slate-300">
                                                {user?.full_name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100">
                                        <Camera className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-bold text-slate-900">{user?.full_name}</h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">{user?.email}</p>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                                        <input
                                            required
                                            value={form.full_name}
                                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Nome da Loja</label>
                                        <input
                                            value={form.store_name}
                                            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">E-mail</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Telefone</label>
                                        <input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="h-11 px-6 font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="animate-in fade-in duration-500 relative">
                            {isLoadingUsage && <LoadingOverlay message="Caregando..." />}

                            <div className="flex flex-col md:flex-row gap-12 mb-12">
                                {/* Current Plan Status */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Plano Atual</h3>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-2xl font-bold text-slate-900">{currentPlan.name}</h4>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Ativo</span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-6">{currentPlan.description}</p>

                                        <div className="space-y-5">
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                                                    <span>Produtos</span>
                                                    <span>{usage.products.used} / {usage.products.limit >= 999999 ? '∞' : usage.products.limit}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${calculateProgress(usage.products.used, usage.products.limit)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                                                    <span>Categorias</span>
                                                    <span>{usage.categories.used} / {usage.categories.limit >= 999999 ? '∞' : usage.categories.limit}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${calculateProgress(usage.categories.used, usage.categories.limit)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upgrades */}
                                <div className="flex-[1.5]">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Planos Disponíveis</h3>
                                    <div className="grid gap-4">
                                        {PLANS.filter(p => !p.hidden).map((p) => {
                                            const isSelected = p.id === effectivePlanId

                                            return (
                                                <div
                                                    key={p.id}
                                                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${isSelected
                                                            ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            <CreditCard className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-900">{p.name}</h4>
                                                                {p.highlight && <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded flex items-center gap-1">POPULAR</span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium">{p.features.slice(0, 2).join(' • ')}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-right">
                                                        <div className="hidden sm:block">
                                                            <p className="font-bold text-slate-900">{p.price}</p>
                                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Mensal</p>
                                                        </div>
                                                        <button
                                                            onClick={() => !isSelected && handleSubscribe(p.id)}
                                                            disabled={isSelected || isSubscribing === p.id}
                                                            className={`h-9 px-4 rounded-lg text-sm font-semibold transition-colors ${isSelected
                                                                    ? 'bg-transparent text-blue-600 cursor-default'
                                                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            {isSubscribing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isSelected ? 'Ativo' : 'Escolher'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                        <p>Você pode fazer downgrade ou upgrade do seu plano a qualquer momento. Os valores serão ajustados na próxima fatura.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in duration-500">

                            <div className="mb-8 max-w-2xl">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Segurança</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Atualize sua senha para manter sua conta segura.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Nova Senha</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            value={form.confirm_password}
                                            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                            className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={saving || !form.password}
                                        className="h-11 px-6 font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Atualizar Senha
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {cropImageSrc && (
                <ImageCropper
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropImageSrc(null)}
                />
            )}
        </div>
    )
}
