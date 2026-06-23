/**
 * Página principal de NF-e: lista, emite e abre o DANFE (prévia).
 *
 * Acesso liberado para clientes com plano pago. A criação de rascunhos delega ao
 * formulário inline `NFeDraftForm` (mantém SRP do componente).
 */
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileText, Plus, Printer, Send, Settings2, X, Info } from 'lucide-react'
import LoadingOverlay from '@/components/LoadingOverlay'
import ConfirmModal from '@/components/ConfirmModal'
import DanfeDocument from '@/components/fiscal/DanfeDocument'
import NFeDraftForm from '@/components/fiscal/NFeDraftForm'
import FiscalAccessGate from '@/components/fiscal/FiscalAccessGate'
import { fiscalApi, type DanfeData, type NFeResponse } from '@/services/fiscal'
import { translateError } from '@/utils/errors'
import { useAuth } from '@/context/AuthContext'
import { hasFiscalAccess } from '@/utils/fiscalAccess'

export default function NFePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const canUseFiscal = hasFiscalAccess(user)
    const [items, setItems] = useState<NFeResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [issuingId, setIssuingId] = useState<number | null>(null)
    const [confirmNfe, setConfirmNfe] = useState<NFeResponse | null>(null)
    const [previewData, setPreviewData] = useState<DanfeData | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [hasFiscalConfig, setHasFiscalConfig] = useState<boolean | null>(null)
    const [hasValidCertificate, setHasValidCertificate] = useState<boolean | null>(null)

    const refresh = async () => {
        try {
            const result = await fiscalApi.listNFes({ per_page: 50 })
            setItems(result.items)
        } catch (err) {
            toast.error(translateError(err) || 'Erro ao listar NF-e.')
        }
    }

    useEffect(() => {
        // Sem acesso fiscal: não dispara chamadas (evita 403/toasts). A tela
        // é renderizada borrada pelo FiscalAccessGate como upsell.
        if (!canUseFiscal) {
            setLoading(false)
            return
        }
        ;(async () => {
            try {
                const [listResult, config, certificate] = await Promise.all([
                    fiscalApi.listNFes({ per_page: 50 }),
                    fiscalApi.getConfig(),
                    fiscalApi.getCertificateStatus(),
                ])
                setItems(listResult.items)
                setHasFiscalConfig(Boolean(config))
                setHasValidCertificate(certificate.has_certificate && !certificate.is_expired)
            } catch (err) {
                toast.error(translateError((err as any)?.response?.data?.detail ?? err) || 'Erro ao carregar NF-e.')
            }
            setLoading(false)
        })()
    }, [canUseFiscal])

    const handleCreate = async (payload: Parameters<typeof fiscalApi.createDraft>[0]) => {
        try {
            setCreating(true)
            const draft = await fiscalApi.createDraft(payload)
            toast.success(`Rascunho criado (#${draft.id}).`)
            setShowForm(false)
            await refresh()
        } catch (err) {
            const detail = (err as any)?.response?.data?.detail
            const status = (err as any)?.response?.status
            const message = typeof detail === 'string' ? detail : translateError(detail ?? err)

            if (status === 412 && String(message).toLowerCase().includes('configuração fiscal')) {
                setHasFiscalConfig(false)
                setShowForm(false)
                toast.error('Cadastre a Configuração Fiscal antes de criar uma NF-e.')
            } else {
                toast.error(message || 'Falha ao criar rascunho.')
            }
        } finally {
            setCreating(false)
        }
    }

    const requestIssue = (nfe: NFeResponse) => {
        if (!hasFiscalConfig) {
            toast.error('Cadastre a Configuração Fiscal antes de emitir NF-e.')
            navigate('/fiscal/configuracao')
            return
        }
        if (!hasValidCertificate) {
            toast.error('Envie um Certificado Digital A1 válido antes de emitir NF-e.')
            navigate('/fiscal/configuracao')
            return
        }
        setConfirmNfe(nfe)
    }

    const handleIssue = async () => {
        const nfe = confirmNfe
        if (!nfe) return
        try {
            setIssuingId(nfe.id)
            const issued = await fiscalApi.issue(nfe.id)
            toast.success(`NF-e ${issued.numero} autorizada.`)
            setConfirmNfe(null)
            await refresh()
        } catch (err) {
            const detail = (err as any)?.response?.data?.detail
            const status = (err as any)?.response?.status
            const message = typeof detail === 'string' ? detail : translateError(detail ?? err)

            if (status === 412 && String(message).toLowerCase().includes('certificado')) {
                setHasValidCertificate(false)
                toast.error(message || 'Envie um Certificado Digital A1 válido antes de emitir NF-e.')
                navigate('/fiscal/configuracao')
            } else if (status === 412 && String(message).toLowerCase().includes('configuração fiscal')) {
                setHasFiscalConfig(false)
                toast.error(message || 'Cadastre a Configuração Fiscal antes de emitir NF-e.')
                navigate('/fiscal/configuracao')
            } else {
                toast.error(message || 'Falha na transmissão à SEFAZ.')
            }
            setConfirmNfe(null)
        } finally {
            setIssuingId(null)
        }
    }

    const handlePreview = async (nfe: NFeResponse) => {
        try {
            const data = await fiscalApi.getDanfe(nfe.id)
            setPreviewData(data)
        } catch (err) {
            toast.error(translateError(err) || 'Falha ao carregar DANFE.')
        }
    }

    const totals = useMemo(() => ({
        autorizadas: items.filter((n) => n.status === 'autorizada').length,
        rascunhos: items.filter((n) => n.status === 'rascunho').length,
        rejeitadas: items.filter((n) => n.status === 'rejeitada').length,
    }), [items])

    if (loading) {
        return (
            <div className="p-6">
                <LoadingOverlay compact message="Carregando NF-e" />
            </div>
        )
    }

    if (previewData) {
        return <DanfePreviewView data={previewData} onClose={() => setPreviewData(null)} />
    }

    return (
        <FiscalAccessGate>
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 sm:space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-primary">
                        <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-text-primary leading-tight">Notas Fiscais Eletrônicas</h1>
                        <p className="text-xs sm:text-sm font-medium text-text-secondary">
                            Emita, acompanhe e gere o DANFE das suas notas.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (!hasFiscalConfig) {
                            navigate('/fiscal/configuracao')
                            return
                        }
                        setShowForm((v) => !v)
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary hover:bg-primary-dark text-card text-sm sm:text-base font-black transition-all active:scale-[0.98]"
                >
                    {!hasFiscalConfig ? <Settings2 className="w-4 h-4" /> : showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {!hasFiscalConfig ? 'Configurar emitente' : showForm ? 'Fechar' : 'Nova NF-e'}
                </button>
            </header>

            <div className="flex flex-wrap gap-2.5">
                <SummaryChip tone="success" label="Autorizadas" value={totals.autorizadas} />
                <SummaryChip tone="muted" label="Rascunhos" value={totals.rascunhos} />
                <SummaryChip tone="error" label="Rejeitadas" value={totals.rejeitadas} />
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                    <span className="font-bold text-text-primary">Módulo recém-lançado.</span> Encontrou um erro ou tem uma sugestão? Fale com o suporte pelo <a href="https://wa.me/5511920688389" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary-dark">WhatsApp</a>.
                </p>
            </div>

            {!hasFiscalConfig && (
                <PendingNotice
                    title="Configuração fiscal pendente"
                    description="Antes de criar rascunhos de NF-e, cadastre os dados do emitente na Configuração Fiscal."
                    actionLabel="Ir para Config. Fiscal"
                    onAction={() => navigate('/fiscal/configuracao')}
                />
            )}

            {hasFiscalConfig && showForm && (
                <NFeDraftForm saving={creating} onSubmit={handleCreate} />
            )}

            {hasFiscalConfig && !hasValidCertificate && (
                <PendingNotice
                    title="Certificado A1 pendente"
                    description="Para emitir NF-e, envie um Certificado Digital A1 válido da empresa na Configuração Fiscal."
                    actionLabel="Enviar certificado"
                    onAction={() => navigate('/fiscal/configuracao')}
                />
            )}

            {/* Desktop: tabela */}
            <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-background/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary/70">#</th>
                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary/70">Destinatário</th>
                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary/70">Status</th>
                            <th className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary/70">Total</th>
                            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary/70">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-14">
                                    <EmptyState />
                                </td>
                            </tr>
                        )}
                        {items.map((nfe) => (
                            <tr key={nfe.id} className="border-t border-border transition-colors hover:bg-background/40">
                                <td className="px-4 py-3 font-black text-text-primary tabular-nums">
                                    {nfe.numero > 0 ? nfe.numero : '—'}
                                    <span className="text-xs font-bold text-text-secondary/70 ml-1">/{nfe.serie}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-text-primary">{nfe.destinatario_nome}</div>
                                    <div className="text-xs font-medium text-text-secondary">{nfe.destinatario_documento}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPill status={nfe.status} motivo={nfe.motivo_rejeicao} />
                                </td>
                                <td className="px-4 py-3 font-bold text-text-primary tabular-nums">
                                    {nfe.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex gap-2">
                                        {(nfe.status === 'rascunho' || nfe.status === 'rejeitada') && (
                                            <button
                                                onClick={() => requestIssue(nfe)}
                                                disabled={issuingId === nfe.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-card text-xs font-black transition-all active:scale-[0.97] disabled:opacity-60"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {issuingId === nfe.id ? 'Enviando…' : 'Emitir'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handlePreview(nfe)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-primary hover:border-brand-200 hover:text-primary text-xs font-black transition-all active:scale-[0.97]"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            DANFE
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile: lista de cartões */}
            <div className="md:hidden space-y-3">
                {items.length === 0 && (
                    <div className="bg-card border border-border rounded-2xl px-4 py-12">
                        <EmptyState />
                    </div>
                )}
                {items.map((nfe) => (
                    <div key={nfe.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 transition-colors hover:border-brand-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="font-bold text-text-primary truncate">{nfe.destinatario_nome}</div>
                                <div className="text-xs font-medium text-text-secondary truncate">{nfe.destinatario_documento}</div>
                            </div>
                            <StatusPill status={nfe.status} motivo={nfe.motivo_rejeicao} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-text-secondary">
                                NF-e <span className="font-black text-text-primary tabular-nums">{nfe.numero > 0 ? nfe.numero : '—'}</span>
                                <span className="text-xs">/{nfe.serie}</span>
                            </span>
                            <span className="font-bold text-text-primary tabular-nums">
                                {nfe.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex gap-2 pt-1">
                            {(nfe.status === 'rascunho' || nfe.status === 'rejeitada') && (
                                <button
                                    onClick={() => requestIssue(nfe)}
                                    disabled={issuingId === nfe.id}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dark text-card text-xs font-black transition-all active:scale-[0.97] disabled:opacity-60"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {issuingId === nfe.id ? 'Enviando…' : 'Emitir'}
                                </button>
                            )}
                            <button
                                onClick={() => handlePreview(nfe)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-text-primary hover:border-brand-200 hover:text-primary text-xs font-black transition-all active:scale-[0.97]"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                DANFE
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={confirmNfe !== null}
                onClose={() => setConfirmNfe(null)}
                onConfirm={handleIssue}
                loading={issuingId !== null}
                type="warning"
                title="Emitir NF-e?"
                message={
                    confirmNfe
                        ? `A NF-e para ${confirmNfe.destinatario_nome} será assinada e transmitida à SEFAZ. Após autorizada, ela passa a ter validade fiscal e só poderá ser desfeita por cancelamento.`
                        : ''
                }
                confirmText="Emitir e transmitir"
                cancelText="Cancelar"
            />
        </div>
        </FiscalAccessGate>
    )
}

function DanfePreviewView({ data, onClose }: { data: DanfeData; onClose: () => void }) {
    return (
        <div className="min-h-screen bg-background py-4 sm:py-8 px-3 sm:px-0">
            <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between gap-3 print:hidden">
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-border text-text-primary hover:bg-card text-sm font-bold"
                >
                    <X className="w-4 h-4" /> <span className="hidden sm:inline">Fechar prévia</span><span className="sm:hidden">Fechar</span>
                </button>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold"
                >
                    <Printer className="w-4 h-4" /> Imprimir <span className="hidden sm:inline">(A4)</span>
                </button>
            </div>
            <DanfeDocument data={data} />
        </div>
    )
}

function StatusPill({ status, motivo }: { status: string; motivo?: string | null }) {
    const map: Record<string, { label: string; cls: string; dot: string }> = {
        rascunho: { label: 'Rascunho', cls: 'bg-background text-text-secondary border border-border', dot: 'bg-text-secondary/50' },
        assinada: { label: 'Assinada', cls: 'bg-warning/10 text-warning border border-warning/30', dot: 'bg-warning' },
        autorizada: { label: 'Autorizada', cls: 'bg-success/10 text-success border border-success/30', dot: 'bg-success' },
        rejeitada: { label: 'Rejeitada', cls: 'bg-error/10 text-error border border-error/30', dot: 'bg-error' },
        denegada: { label: 'Denegada', cls: 'bg-error/10 text-error border border-error/30', dot: 'bg-error' },
        cancelada: { label: 'Cancelada', cls: 'bg-background text-text-secondary border border-border', dot: 'bg-text-secondary/50' },
        erro: { label: 'Erro', cls: 'bg-error/10 text-error border border-error/30', dot: 'bg-error' },
    }
    const conf = map[status] || { label: status, cls: 'bg-background text-text-secondary border border-border', dot: 'bg-text-secondary/50' }
    return (
        <span title={motivo || undefined} className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full ${conf.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} aria-hidden="true" />
            {conf.label}
        </span>
    )
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: 'success' | 'error' | 'muted' }) {
    const dot = { success: 'bg-success', error: 'bg-error', muted: 'bg-text-secondary/40' }[tone]
    return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
            <span className="text-sm font-black tabular-nums text-text-primary">{value}</span>
            <span className="text-xs font-bold text-text-secondary">{label}</span>
        </div>
    )
}

function PendingNotice({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 sm:p-5">
            <div className="flex gap-3">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/15 text-warning">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-text-primary">{title}</h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-text-secondary">{description}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onAction}
                className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-card transition-all active:scale-[0.98] hover:bg-primary-dark"
            >
                <Settings2 className="w-4 h-4" />
                {actionLabel}
            </button>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-border bg-background text-text-secondary/60">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <p className="mt-3 text-sm font-black text-text-primary">Nenhuma NF-e por aqui</p>
            <p className="mt-1 text-xs font-medium text-text-secondary">Crie um rascunho em “Nova NF-e” para começar.</p>
        </div>
    )
}
