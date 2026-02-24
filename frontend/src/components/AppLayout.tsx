import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Package,
    LayoutDashboard,
    Boxes,
    Tags,
    ClipboardList,
    LogOut,
    Menu,
    X,
    Crown,
    User as UserIcon
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/produtos', label: 'Produtos', icon: Boxes },
    { to: '/categorias', label: 'Categorias', icon: Tags },
    { to: '/romaneio', label: 'Romaneio', icon: ClipboardList },
    { to: '/planos', label: 'Planos', icon: Crown },
]

export default function AppLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex transition-colors duration-500">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/40 flex flex-col
        shadow-[20px_0_40px_rgba(0,0,0,0.02)]
        transform transition-all duration-300 ease-in-out md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100/50 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-brand-500/20">
                        <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-bold text-slate-900 tracking-tight">Romaneio<span className="text-brand-600">Rapido</span></span>
                    <button className="md:hidden ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 group ${isActive
                                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100/50'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${sidebarOpen ? 'animate-in fade-in slide-in-from-left-2' : ''}`} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="px-4 py-5 border-t border-slate-100/50 bg-slate-50/30">
                    <div className="flex items-center gap-3 px-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                            {user?.photo_base64 ? <img src={user.photo_base64} alt="Avatar" className="w-full h-full object-cover" /> : user?.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{user?.full_name}</p>
                            <p className="text-[11px] font-medium text-slate-400 truncate uppercase tracking-wider">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { navigate('/perfil'); setSidebarOpen(false) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 w-full text-[13px] font-semibold text-slate-500 hover:text-brand-600 hover:bg-white rounded-xl transition-all mb-1 border border-transparent hover:border-brand-100 hover:shadow-sm"
                    >
                        <UserIcon className="w-4 h-4" />
                        Meu Perfil
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2.5 w-full text-[13px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside >

            {/* Overlay mobile */}
            {
                sidebarOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)} />
                )
            }

            {/* Main */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                {/* Top bar mobile */}
                <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all shadow-md shadow-brand-500/20">
                            <Package className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Romaneio<span className="text-brand-600">Rapido</span></span>
                    </div>
                    <div className="w-10"></div> {/* Spacer for symmetry */}
                </header>

                <main className="flex-1 p-4 md:p-8 lg:p-10 animate-slide-up">
                    <Outlet />
                </main>
            </div>
        </div >
    )
}
