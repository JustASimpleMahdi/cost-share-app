import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import type { SettlementBatch, SettlementPayment } from '../../types/SettlementBatch'
import { Cost } from '../types/Cost'

const EXPENSES_STORAGE_KEY = 'expenses'
const SETTLEMENT_BATCHES_STORAGE_KEY = 'settlement_batches'

type ExpenseContextType = {
    expenses: Cost[]
    settlementBatches: SettlementBatch[]
    addExpense: (expense: Cost) => Promise<void>
    updateExpense: (expense: Cost) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    settleExpenses: (payments: SettlementPayment[]) => Promise<void>
}
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Cost[]>([])
    const [settlementBatches, setSettlementBatches] = useState<SettlementBatch[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [storedExpenses, storedSettlementBatches] = await Promise.all([
                    AsyncStorage.getItem(EXPENSES_STORAGE_KEY),
                    AsyncStorage.getItem(SETTLEMENT_BATCHES_STORAGE_KEY),
                ])

                if (storedExpenses) {
                    setExpenses(JSON.parse(storedExpenses))
                }

                if (storedSettlementBatches) {
                    setSettlementBatches(JSON.parse(storedSettlementBatches))
                }
            } catch (error) {
                console.error('Failed to load expenses:', error)
            } finally {
                setLoaded(true)
            }
        }

        loadData()
    }, [])

    const addExpense = async (expense: Cost) => {
        const updatedExpenses = [...expenses, expense]

        setExpenses(updatedExpenses)

        try {
            await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses))
        } catch (error) {
            console.error('Failed to save expense:', error)
        }
    }
    const updateExpense = async (updatedExpense: Cost) => {
        const updatedExpenses = expenses.map((expense) =>
            expense.id === updatedExpense.id ? updatedExpense : expense,
        )

        setExpenses(updatedExpenses)

        try {
            await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses))
        } catch (error) {
            console.error('Failed to update expense:', error)
        }
    }
    const deleteExpense = async (id: string) => {
        const updatedExpenses = expenses.filter((expense) => expense.id !== id)

        setExpenses(updatedExpenses)

        try {
            await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses))
        } catch (error) {
            console.error('Failed to delete expense:', error)
        }
    }
    const settleExpenses = async (payments: SettlementPayment[]) => {
        const currentExpenses = expenses.filter((expense) => !expense.settled)

        if (currentExpenses.length === 0) {
            return
        }

        const batch: SettlementBatch = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            expenseIds: currentExpenses.map((expense) => expense.id),
            payments,
        }

        const updatedBatches = [...settlementBatches, batch]

        const updatedExpenses = expenses.map((expense) =>
            expense.settled
                ? expense
                : {
                      ...expense,
                      settled: true,
                      settlementBatchId: batch.id,
                  },
        )

        setExpenses(updatedExpenses)
        setSettlementBatches(updatedBatches)

        try {
            await Promise.all([
                AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses)),
                AsyncStorage.setItem(
                    SETTLEMENT_BATCHES_STORAGE_KEY,
                    JSON.stringify(updatedBatches),
                ),
            ])
        } catch (error) {
            console.error('Failed to settle expenses:', error)
        }
    }

    if (!loaded) {
        return null
    }

    return (
        <ExpenseContext.Provider
            value={{
                expenses,
                settlementBatches,
                addExpense,
                updateExpense,
                deleteExpense,
                settleExpenses,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    )
}

export function useExpenses() {
    const context = useContext(ExpenseContext)

    if (!context) {
        throw new Error('useExpenses must be used inside ExpenseProvider')
    }

    return context
}
