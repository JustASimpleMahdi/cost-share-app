export type SettlementPayment = {
    from: string
    to: string
    amount: number
}

export type SettlementBatch = {
    id: string
    createdAt: string
    expenseIds: string[]
    payments: SettlementPayment[]
}
