import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Camera, Save, Key, Loader2, User as UserIcon, Store, Phone, Mail } from 'lucide-react'
import ImageCropper from '../components/ImageCropper'

export default function ProfilePage() {
    const { user, login } = useAuth()

    const [saving, setSaving] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

        if (form.password && form.password !== form.confirm_password) {
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

            // Precisamos ter a API /auth/me usando PUT implementada
            // Ela existe agora, vamos testar.
            await api.put('/auth/me', payload)

            toast.success('Perfil atualizado com sucesso!')

            // Força o User a recarregar no context logo em seguida. 
            // Uma ideia mais limpa é o `App` recarregar, mas recarregar a página ou o auth faz as informações atualizarem no header
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao atualizar perfil')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <UserIcon className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg" />
                    Meu Perfil
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gerencie suas informações pessoais e credenciais da conta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

                {/* Seção Foto */}
                <div className="flex flex-col items-center mb-10">
                    <div
                        className="relative w-32 h-32 rounded-full border-4 border-gray-50 bg-gray-100 flex items-center justify-center cursor-pointer group overflow-hidden mb-3"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <button
                        type="button"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Alterar Foto
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome Completo *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                required
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                className="w-full h-11 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                placeholder="João da Silva"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome do Estabelecimento / Loja</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                value={form.store_name}
                                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                                className="w-full h-11 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                placeholder="Minha Loja Legal"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full h-11 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telefone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full h-11 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 mt-4 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            Alterar Senha
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nova Senha</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    placeholder="Deixe em branco para não alterar"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
                                <input
                                    type="password"
                                    value={form.confirm_password}
                                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    placeholder="Confirme a nova senha"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-11 px-6 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>

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
