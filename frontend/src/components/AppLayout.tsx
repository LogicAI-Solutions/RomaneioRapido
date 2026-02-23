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
    Crown
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
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-200 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-14 px-5 flex items-center gap-2.5 border-b border-gray-100 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <Package className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Romaneio<span className="text-blue-600">Rapido</span></span>
                    <button className="md:hidden ml-auto p-1 text-gray-400" onClick={() => setSidebarOpen(false)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{user?.full_name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 w-full text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair
                    </button>
                </div>
            </aside >

            {/* Overlay mobile */}
            {
                sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
                )
            }

            {/* Main */}
            <div className="flex-1 md:ml-60">
                {/* Top bar mobile */}
                <header className="md:hidden h-14 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-600">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <Package className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Romaneio<span className="text-blue-600">Rapido</span></span>
                    </div>
                </header>

                <main className="p-5 md:p-8 max-w-7xl">
                    <Outlet />
                </main>
            </div>
        </div >
    )
}
