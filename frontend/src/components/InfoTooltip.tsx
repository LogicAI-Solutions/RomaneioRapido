/**
 * Tooltip de ajuda exibido ao passar o mouse (ou focar) sobre um ícone "?".
 *
 * Implementação CSS-only via `group`/`group-hover` (mesmo padrão já usado no
 * projeto), sem dependências de bibliotecas de overlay. Acessível por teclado:
 * o ícone é focável e o texto aparece em `focus-within`.
 */
import { HelpCircle } from 'lucide-react'

interface Props {
    text: string
    /** Posição do balão em relação ao ícone. Padrão: acima. */
    side?: 'top' | 'bottom'
}

export default function InfoTooltip({ text, side = 'top' }: Props) {
    const sideClasses =
        side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'

    return (
        <span className="relative inline-flex group/tip align-middle">
            <HelpCircle
                tabIndex={0}
                aria-label={text}
                className="w-3.5 h-3.5 text-text-secondary/70 hover:text-brand-500 focus:text-brand-500 cursor-help outline-none transition-colors"
            />
            <span
                role="tooltip"
                className={`pointer-events-none absolute left-1/2 z-50 w-60 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-medium leading-snug text-text-primary normal-case opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${sideClasses}`}
            >
                {text}
            </span>
        </span>
    )
}
