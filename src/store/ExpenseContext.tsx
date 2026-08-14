import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { Cost } from '../types/Cost'

const EXPENSES_STORAGE_KEY = 'expenses'

type ExpenseContextType = {
    expenses: Cost[]
    addExpense: (expense: Cost) => Promise<void>
    updateExpense: (expense: Cost) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    settleExpenses: () => Promise<void>
}
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Cost[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const loadExpenses = async () => {
            try {
                const storedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY)

                if (storedExpenses) {
                    setExpenses(JSON.parse(storedExpenses))
                }
            } catch (error) {
                console.error('Failed to load expenses:', error)
            } finally {
                setLoaded(true)
            }
        }

        loadExpenses()
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
    const settleExpenses = async () => {
        const updatedExpenses = expenses.map((expense) => ({
            ...expense,
            settled: true,
        }))

        setExpenses(updatedExpenses)

        try {
            await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses))
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
