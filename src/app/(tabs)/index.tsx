import { Link, router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { Cost } from '@/types/Cost'
import { PEOPLE } from '../../data/people'
import { useExpenses } from '../../store/ExpenseContext'

export default function Index() {
    const { expenses } = useExpenses()

    const getPersonName = (personId: string) => {
        return PEOPLE.find((person) => person.id === personId)?.name ?? personId
    }

    const getTotal = (expense: Cost) => {
        return Object.values(expense.shares).reduce((sum, share) => sum + share, 0)
    }

    const currentExpenses = expenses.filter((expense) => !expense.settled)
    const totalAmount = currentExpenses.reduce((sum, expense) => sum + getTotal(expense), 0)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Expenses</Text>

                {currentExpenses.length > 0 && (
                    <Text style={styles.subtitle}>
                        {currentExpenses.length}{' '}
                        {currentExpenses.length === 1 ? 'expense' : 'expenses'} ·{' '}
                        {totalAmount.toLocaleString()}
                    </Text>
                )}
            </View>

            {currentExpenses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Pressable style={styles.emptyIcon} onPress={() => router.push('/add-expense')}>
                        <Text style={styles.emptyIconText}>+</Text>
                    </Pressable>

                    <Text style={styles.emptyTitle}>No current expenses</Text>

                    <Text style={styles.emptySubtitle}>
                        Add your first expense to start a cycle.
                    </Text>
                </View>
            ) : (
                <View style={styles.expenses}>
                    {currentExpenses.map((expense) => (
                        <Pressable
                            key={expense.id}
                            style={({ pressed }) => [
                                styles.expense,
                                pressed && styles.expensePressed,
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: '/edit-expense',
                                    params: {
                                        id: expense.id,
                                    },
                                })
                            }
                        >
                            <View style={styles.expenseInfo}>
                                <Text style={styles.expenseTitle}>{expense.title}</Text>

                                <Text style={styles.expensePaidBy}>
                                    Paid by {getPersonName(expense.paidBy)}
                                </Text>
                            </View>

                            <Text style={styles.expenseAmount}>
                                {getTotal(expense).toLocaleString()}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <View style={styles.actions}>
                <Link href="/add-expense" asChild>
                    <Pressable
                        style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                    >
                        <Text style={styles.addButtonText}>Add Expense</Text>
                    </Pressable>
                </Link>

                {currentExpenses.length > 0 && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.debtsButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => router.push('/debts')}
                    >
                        <Text style={styles.debtsButtonText}>View Debts</Text>
                    </Pressable>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 20,
        paddingTop: 60,
    },

    header: {
        marginBottom: 24,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111',
    },

    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: '#777',
    },

    expenses: {
        gap: 10,
    },

    expense: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e9e9e9',
    },

    expensePressed: {
        opacity: 0.7,
    },

    expenseInfo: {
        flex: 1,
    },

    expenseTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111',
    },

    expensePaidBy: {
        marginTop: 5,
        fontSize: 13,
        color: '#888',
    },

    expenseAmount: {
        marginLeft: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    actions: {
        marginTop: 'auto',
        paddingBottom: 100,
        gap: 10,
    },

    addButton: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#111',
        alignItems: 'center',
    },

    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    debtsButton: {
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },

    debtsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },

    buttonPressed: {
        opacity: 0.7,
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingBottom: 80,
    },

    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    emptyIconText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '300',
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        maxWidth: 280,
    },
})
