import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { Cost } from '@/types/Cost'
import { router } from 'expo-router'
import { PEOPLE } from '../data/people'
import { useExpenses } from '../store/ExpenseContext'

export default function Index() {
    const { expenses } = useExpenses()

    const getPersonName = (personId: string) => {
        return PEOPLE.find((person) => person.id === personId)?.name ?? personId
    }
    const getTotal = (expense: Cost) => {
        return Object.values(expense.shares).reduce((sum, share) => sum + share, 0)
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expenses</Text>

            {expenses.length === 0 ? (
                <Text style={styles.emptyText}>No expenses yet.</Text>
            ) : (
                expenses.map((expense) => (
                    <Pressable
                        key={expense.id}
                        style={styles.expense}
                        onPress={() =>
                            router.push({
                                pathname: '/edit-expense',
                                params: {
                                    id: expense.id,
                                },
                            })
                        }
                    >
                        <View>
                            <Text style={styles.expenseTitle}>{expense.title}</Text>

                            <Text style={styles.expensePaidBy}>
                                Paid by {getPersonName(expense.paidBy)}
                            </Text>
                        </View>

                        <Text style={styles.expenseAmount}>{getTotal(expense)}</Text>
                    </Pressable>
                ))
            )}

            <Link href="/add-expense" asChild>
                <Pressable style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Expense</Text>
                </Pressable>
            </Link>
            <Pressable style={styles.debtsButton} onPress={() => router.push('/debts')}>
                <Text style={styles.debtsButtonText}>View Debts</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
    },

    emptyText: {
        fontSize: 16,
        color: '#666',
    },

    expense: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
    },

    expenseTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    expensePaidBy: {
        marginTop: 4,
        color: '#666',
    },

    expenseAmount: {
        fontSize: 18,
        fontWeight: '600',
    },

    addButton: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#000',
        alignItems: 'center',
    },

    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    debtsButton: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#000',
        alignItems: 'center',
    },

    debtsButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
})
