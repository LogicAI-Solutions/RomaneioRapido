export interface PlanFeature {
    text: string
    included: boolean
}

export interface Plan {
    id: string
    name: string
    price: string
    period?: string
    description: string
    features: string[]
    highlight: boolean
    limit_products: number
    limit_categories: number
    color: string
    hidden?: boolean
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Grátis',
        price: 'R$ 0',
        description: 'Perfeito para começar.',
        features: [
            'Até 10 produtos',
            'Até 2 categorias',
            'Suporte via email'
        ],
        highlight: false,
        limit_products: 10,
        limit_categories: 2,
        color: 'emerald'
    },
    {
        id: 'basic',
        name: 'Básico',
        price: 'R$ 49,90',
        period: '/mês',
        description: 'Para pequenos negócios.',
        features: [
            'Até 30 produtos',
            'Até 3 categorias',
            'Suporte via email'
        ],
        highlight: false,
        limit_products: 30,
        limit_categories: 3,
        color: 'blue'
    },
    {
        id: 'plus',
        name: 'Plus',
        price: 'R$ 89,90',
        period: '/mês',
        description: 'Para negócios em crescimento.',
        features: [
            'Até 50 produtos',
            'Até 5 categorias',
            'Suporte prioritário'
        ],
        highlight: true,
        limit_products: 50,
        limit_categories: 5,
        color: 'blue'
    },
    {
        id: 'pro',
        name: 'Profissional',
        price: 'R$ 129,90',
        period: '/mês',
        description: 'Para negócios consolidados.',
        features: [
            'Até 100 produtos',
            'Até 10 categorias',
            'Suporte 24/7'
        ],
        highlight: false,
        limit_products: 100,
        limit_categories: 10,
        color: 'purple'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Ilimitado',
        description: 'Plano exclusivo para administradores.',
        features: [
            'Produtos ilimitados',
            'Categorias ilimitadas',
            'Suporte prioritário',
            'Gestão total'
        ],
        highlight: false,
        limit_products: 999999,
        limit_categories: 999999,
        color: 'slate',
        hidden: true
    }
]
