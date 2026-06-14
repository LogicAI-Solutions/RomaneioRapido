/**
 * Grupo de navegação "Nota Fiscal" para a sidebar.
 *
 * Reúne as rotas fiscais (emissão de NF-e e configuração do emitente) sob um
 * único item que abre um submenu. Comporta-se como acordeão quando a sidebar
 * está expandida e como flyout (ao passar o mouse) quando recolhida.
 *
 * No modo recolhido o flyout é posicionado com `position: fixed` calculado a
 * partir do botão, pois o `<nav>` da sidebar usa `overflow-y-auto` (que também
 * recorta o eixo horizontal) e cortaria um popover posicionado por CSS.
 */
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, FileText, Settings2, ReceiptText } from 'lucide-react'
import { toast } from 'react-hot-toast'

const CHILDREN = [
    { to: '/fiscal/nfe', label: 'Emissão de NF-e', icon: FileText },
    { to: '/fiscal/configuracao', label: 'Configuração Fiscal', icon: Settings2 },
]

interface Props {
    isCollapsed: boolean
    isLocked: boolean
    lockMessage: string
    onNavigate: () => void
}

export default function NotaFiscalNavGroup({ isCollapsed, isLocked, lockMessage, onNavigate }: Props) {
    const location = useLocation()
    const isChildActive = CHILDREN.some((c) => location.pathname.startsWith(c.to))
    const [open, setOpen] = useState(isChildActive)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [flyout, setFlyout] = useState<{ top: number; left: number } | null>(null)

    // Abre automaticamente o grupo quando uma rota filha está ativa.
    useEffect(() => {
        if (isChildActive) setOpen(true)
    }, [isChildActive])

    const handleChildClick = (e: React.MouseEvent) => {
        if (isLocked) {
            e.preventDefault()
            toast.error(lockMessage)
            return
        }
        setFlyout(null)
        onNavigate()
    }

    const childLink = (child: (typeof CHILDREN)[number]) => (
        <NavLink
            key={child.to}
            to={isLocked ? '#' : child.to}
            onClick={handleChildClick}
            className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100/50'
                        : isLocked
                          ? 'text-text-secondary/60 cursor-not-allowed opacity-50'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                }`
            }
        >
            <child.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{child.label}</span>
        </NavLink>
    )

    // ── Sidebar recolhida: ícone + flyout (fixed) ao passar o mouse ──────────
    if (isCollapsed) {
        const openFlyout = () => {
            const rect = buttonRef.current?.getBoundingClientRect()
            if (rect) setFlyout({ top: rect.top, left: rect.right })
        }
        return (
            <div onMouseEnter={openFlyout} onMouseLeave={() => setFlyout(null)}>
                <button
                    ref={buttonRef}
                    type="button"
                    title="Nota Fiscal"
                    className={`flex items-center justify-center w-full p-3 rounded-xl transition-all duration-200 group ${
                        isChildActive
                            ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100/50'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                    }`}
                >
                    <ReceiptText className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                </button>

                {/* Flyout posicionado em coordenadas de viewport (escapa do overflow) */}
                {flyout && (
                    <div
                        className="fixed z-[70] pl-2"
                        style={{ top: flyout.top, left: flyout.left }}
                    >
                        <div className="w-56 bg-card border border-border rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-left-2 duration-150">
                            <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary/70">
                                Nota Fiscal
                            </p>
                            <div className="space-y-1">{CHILDREN.map(childLink)}</div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── Sidebar expandida: acordeão ──────────────────────────────────────────
    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 group ${
                    isChildActive
                        ? 'text-brand-700'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                }`}
            >
                <ReceiptText className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="flex-1 text-left whitespace-nowrap truncate">Nota Fiscal</span>
                <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Submenu */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="ml-5 mt-1 pl-3 border-l border-border/70 space-y-1">
                        {CHILDREN.map(childLink)}
                    </div>
                </div>
            </div>
        </div>
    )
}
