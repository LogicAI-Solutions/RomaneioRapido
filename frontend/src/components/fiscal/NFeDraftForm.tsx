/**
 * Formulário de rascunho de NF-e.
 *
 * Encapsula destinatário + itens com validações estruturais (CPF/CNPJ,
 * NCM/CFOP/CSOSN). Não consulta produtos do estoque — o consumo aqui
 * é manual; a integração com produtos pode ser feita posteriormente
 * pela página chamadora, sem alterar este componente.
 */
import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { DocumentInput, CepInput, IeInput } from '@/components/fiscal/MaskedInput'
import InfoTooltip from '@/components/InfoTooltip'
import { isValidCNPJ, isValidCPF, stripNonDigits } from '@/utils/masks'
import type { NFeDraftPayload, NFeItemInput } from '@/services/fiscal'

interface Props {
    saving: boolean
    onSubmit: (payload: NFeDraftPayload) => void
}

const CSOSN_OPTIONS = [
    { value: '101', label: '101 — Tributada c/ permissão de crédito' },
    { value: '102', label: '102 — Tributada s/ permissão de crédito' },
    { value: '103', label: '103 — Isenção ICMS (faixa de receita)' },
    { value: '300', label: '300 — Imune' },
    { value: '400', label: '400 — Não tributada' },
    { value: '900', label: '900 — Outros' },
]

const emptyItem = (): NFeItemInput => ({
    codigo: '',
    descricao: '',
    ncm: '',
    cfop: '5102',
    unidade_comercial: 'UN',
    ean: '',
    quantidade: 1,
    valor_unitario: 0,
    csosn: '102',
    origem: '0',
})

export default function NFeDraftForm({ saving, onSubmit }: Props) {
    const [naturezaOperacao, setNaturezaOperacao] = useState('VENDA DE MERCADORIA')
    const [informacoesAdicionais, setInformacoesAdicionais] = useState('')
    const [dest, setDest] = useState({
        nome: '',
        documento: '',
        inscricao_estadual: '',
        email: '',
        telefone: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        municipio: '',
        cod_municipio_ibge: '',
        uf: '',
        cep: '',
    })
    const [itens, setItens] = useState<NFeItemInput[]>([emptyItem()])
    const [error, setError] = useState<string | null>(null)

    const total = useMemo(
        () => itens.reduce((acc, i) => acc + (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0), 0),
        [itens]
    )

    const setItem = (idx: number, patch: Partial<NFeItemInput>) => {
        setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const doc = stripNonDigits(dest.documento)
        const docOk = doc.length === 14 ? isValidCNPJ(doc) : doc.length === 11 ? isValidCPF(doc) : false
        if (!docOk) {
            setError('Documento do destinatário inválido (CPF ou CNPJ).')
            return
        }
        if (!dest.nome.trim()) {
            setError('Nome do destinatário é obrigatório.')
            return
        }
        if (itens.length === 0) {
            setError('Adicione ao menos um item.')
            return
        }
        for (const [i, it] of itens.entries()) {
            if (!it.descricao.trim() || !it.codigo.trim()) {
                setError(`Item ${i + 1}: código e descrição são obrigatórios.`)
                return
            }
            if (Number(it.quantidade) <= 0 || Number(it.valor_unitario) < 0) {
                setError(`Item ${i + 1}: quantidade > 0 e valor unitário ≥ 0.`)
                return
            }
        }
        setError(null)

        const payload: NFeDraftPayload = {
            natureza_operacao: naturezaOperacao,
            informacoes_adicionais: informacoesAdicionais || null,
            destinatario: {
                nome: dest.nome.trim(),
                documento: doc,
                inscricao_estadual: dest.inscricao_estadual || null,
                email: dest.email || null,
                telefone: dest.telefone || null,
                endereco: dest.logradouro
                    ? {
                          logradouro: dest.logradouro,
                          numero: dest.numero || 'S/N',
                          complemento: dest.complemento || null,
                          bairro: dest.bairro,
                          municipio: dest.municipio,
                          cod_municipio_ibge: stripNonDigits(dest.cod_municipio_ibge),
                          uf: dest.uf.toUpperCase(),
                          cep: stripNonDigits(dest.cep),
                      }
                    : null,
            },
            itens: itens.map((it) => ({
                ...it,
                ncm: stripNonDigits(it.ncm),
                cfop: stripNonDigits(it.cfop),
                quantidade: Number(it.quantidade),
                valor_unitario: Number(it.valor_unitario),
                ean: it.ean || null,
            })),
        }
        onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Natureza da operação *" hint="Descrição do motivo da emissão (ex.: Venda de mercadoria, Devolução, Remessa). Aparece impressa na DANFE.">
                    <Input value={naturezaOperacao} onChange={setNaturezaOperacao} required />
                </Field>
                <Field label="Informações adicionais" hint="Texto livre de interesse do fisco ou do cliente, impresso no rodapé da NF-e. Opcional.">
                    <Input value={informacoesAdicionais} onChange={setInformacoesAdicionais} />
                </Field>
            </div>

            <section className="space-y-4">
                <h3 className="text-sm font-bold text-text-primary">Destinatário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome / Razão social *" hint="Nome completo (pessoa física) ou razão social (empresa) de quem vai receber a nota.">
                        <Input value={dest.nome} onChange={(v) => setDest({ ...dest, nome: v })} required />
                    </Field>
                    <Field label="CPF/CNPJ *" hint="Documento do destinatário: CPF (11 dígitos) para pessoa física ou CNPJ (14 dígitos) para empresa.">
                        <DocumentInput
                            value={dest.documento}
                            onChange={(_, raw) => setDest({ ...dest, documento: raw })}
                            required
                        />
                    </Field>
                    <Field label="Inscrição estadual" hint="IE do destinatário quando for empresa contribuinte de ICMS. Deixe vazio para consumidor final ou isento.">
                        <IeInput
                            value={dest.inscricao_estadual}
                            onChange={(_, raw) => setDest({ ...dest, inscricao_estadual: raw })}
                        />
                    </Field>
                    <Field label="E-mail" hint="E-mail do destinatário para envio da NF-e e da DANFE. Opcional.">
                        <Input type="email" value={dest.email} onChange={(v) => setDest({ ...dest, email: v })} />
                    </Field>
                    <Field label="Logradouro" hint="Rua, avenida ou praça do destinatário. O endereço todo é opcional, mas recomendado.">
                        <Input value={dest.logradouro} onChange={(v) => setDest({ ...dest, logradouro: v })} />
                    </Field>
                    <Field label="Número" hint="Número do imóvel do destinatário. Use S/N quando não houver.">
                        <Input value={dest.numero} onChange={(v) => setDest({ ...dest, numero: v })} />
                    </Field>
                    <Field label="Bairro" hint="Bairro do endereço do destinatário.">
                        <Input value={dest.bairro} onChange={(v) => setDest({ ...dest, bairro: v })} />
                    </Field>
                    <Field label="Município" hint="Cidade do destinatário, sem abreviações.">
                        <Input value={dest.municipio} onChange={(v) => setDest({ ...dest, municipio: v })} />
                    </Field>
                    <Field label="Código IBGE do município" hint="Código de 7 dígitos do município do destinatário segundo o IBGE. Exigido quando o endereço é informado.">
                        <Input
                            value={dest.cod_municipio_ibge}
                            onChange={(v) => setDest({ ...dest, cod_municipio_ibge: v })}
                            placeholder="7 dígitos"
                        />
                    </Field>
                    <Field label="UF" hint="Sigla do estado do destinatário com 2 letras (ex.: SP, RJ).">
                        <Input
                            value={dest.uf}
                            onChange={(v) => setDest({ ...dest, uf: v.toUpperCase().slice(0, 2) })}
                        />
                    </Field>
                    <Field label="CEP" hint="CEP do endereço do destinatário (8 dígitos).">
                        <CepInput value={dest.cep} onChange={(_, raw) => setDest({ ...dest, cep: raw })} />
                    </Field>
                </div>
            </section>

            <section className="space-y-3">
                <header className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary">Itens</h3>
                    <button
                        type="button"
                        onClick={() => setItens((prev) => [...prev, emptyItem()])}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text-primary hover:bg-background text-xs font-bold"
                    >
                        <Plus className="w-3.5 h-3.5" /> Adicionar item
                    </button>
                </header>

                <div className="space-y-3">
                    {itens.map((it, idx) => (
                        <div key={idx} className="rounded-xl border border-border p-4 bg-background/30">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <Field label="Código *" hint="Código interno do produto no seu sistema (SKU). Serve para você identificar o item.">
                                    <Input value={it.codigo} onChange={(v) => setItem(idx, { codigo: v })} required />
                                </Field>
                                <Field label="Descrição *" hint="Descrição do produto como aparecerá na nota fiscal.">
                                    <Input value={it.descricao} onChange={(v) => setItem(idx, { descricao: v })} required />
                                </Field>
                                <Field label="NCM *" hint="Nomenclatura Comum do Mercosul: código de 8 dígitos que classifica a mercadoria e define sua tributação.">
                                    <Input value={it.ncm} onChange={(v) => setItem(idx, { ncm: v })} required />
                                </Field>
                                <Field label="CFOP *" hint="Código Fiscal de Operações e Prestações (4 dígitos) que indica o tipo de operação. Ex.: 5102 = venda dentro do estado; 6102 = venda para outro estado.">
                                    <Input value={it.cfop} onChange={(v) => setItem(idx, { cfop: v })} required />
                                </Field>
                                <Field label="Unidade" hint="Unidade comercial do produto (ex.: UN, KG, CX, L, M).">
                                    <Input value={it.unidade_comercial} onChange={(v) => setItem(idx, { unidade_comercial: v })} />
                                </Field>
                                <Field label="Quantidade *" hint="Quantidade comercializada deste item.">
                                    <Input
                                        type="number"
                                        value={String(it.quantidade)}
                                        onChange={(v) => setItem(idx, { quantidade: Number(v) })}
                                        required
                                    />
                                </Field>
                                <Field label="Valor unitário *" hint="Preço de uma unidade do produto, sem descontos. O total do item é calculado automaticamente.">
                                    <Input
                                        type="number"
                                        value={String(it.valor_unitario)}
                                        onChange={(v) => setItem(idx, { valor_unitario: Number(v) })}
                                        required
                                    />
                                </Field>
                                <Field label="CSOSN *" hint="Código de Situação da Operação no Simples Nacional: define como o ICMS do item é tratado. Em caso de dúvida, consulte seu contador.">
                                    <select
                                        value={it.csosn}
                                        onChange={(e) => setItem(idx, { csosn: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary"
                                    >
                                        {CSOSN_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                            {itens.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setItens((prev) => prev.filter((_, i) => i !== idx))}
                                    className="mt-3 inline-flex items-center gap-1 text-xs text-error font-bold"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remover item
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {error && (
                <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-sm text-text-secondary">
                    Total estimado:{' '}
                    <span className="font-bold text-text-primary">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-60"
                >
                    {saving ? 'Salvando…' : 'Salvar rascunho'}
                </button>
            </div>
        </form>
    )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary mb-1">
                {label}
                {hint && <InfoTooltip text={hint} />}
            </span>
            {children}
        </label>
    )
}

function Input({
    value,
    onChange,
    ...rest
}: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
    return (
        <input
            {...rest}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
        />
    )
}
