/**
 * Tooltip de ajuda exibido ao passar o mouse (desktop) ou ao tocar (mobile).
 *
 * No desktop o balão aparece no hover; no mobile, onde não há hover, ele é
 * alternado por toque (clique) e fecha ao tocar fora, ao rolar a página ou
 * com a tecla Esc. Como o gatilho costuma ficar dentro de um `<label>`, o
 * clique é isolado (stopPropagation + preventDefault) para não focar o input
 * associado.
 */
import { useEffect, useRef, useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface Props {
    text: string
    /** Posição do balão em relação ao ícone. Padrão: acima. */
    side?: 'top' | 'bottom'
}

export default function InfoTooltip({ text, side = 'top' }: Props) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLSpanElement>(null)

    const sideClasses = side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'

    // Fecha ao tocar/clicar fora, rolar ou pressionar Esc.
    useEffect(() => {
        if (!open) return

        const handlePointer = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        const handleScroll = () => setOpen(false)

        document.addEventListener('pointerdown', handlePointer)
        document.addEventListener('keydown', handleKey)
        window.addEventListener('scroll', handleScroll, true)
        return () => {
            document.removeEventListener('pointerdown', handlePointer)
            document.removeEventListener('keydown', handleKey)
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [open])

    return (
        <span ref={containerRef} className="relative inline-flex group/tip align-middle">
            <button
                type="button"
                aria-label={text}
                aria-expanded={open}
                onClick={(e) => {
                    // Evita que o clique propague para o <label> e foque o input.
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen((v) => !v)
                }}
                className="inline-flex text-text-secondary/70 hover:text-brand-500 focus:text-brand-500 cursor-help outline-none transition-colors"
            >
                <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <span
                role="tooltip"
                className={`pointer-events-none absolute left-1/2 z-50 w-60 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-medium leading-snug text-text-primary normal-case shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100 ${sideClasses} ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {text}
            </span>
        </span>
    )
}
