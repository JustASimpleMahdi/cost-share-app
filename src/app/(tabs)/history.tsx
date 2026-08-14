import { StyleSheet, Text, View } from 'react-native'

import type { Cost } from '@/types/Cost'
import { PEOPLE } from '../../data/people'
import { useExpenses } from '../../store/ExpenseContext'

export default function History() {
    const { expenses } = useExpenses()

    const settledExpenses = expenses.filter((expense) => expense.settled)

    const getPersonName = (personId: string) => {
        return PEOPLE.find((person) => person.id === personId)?.name ?? personId
    }

    const getTotal = (expense: Cost) => {
        return Object.values(expense.shares).reduce((sum, share) => sum + share, 0)
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>

                {settledExpenses.length > 0 && (
                    <Text style={styles.subtitle}>
                        {settledExpenses.length}{' '}
                        {settledExpenses.length === 1 ? 'expense' : 'expenses'}
                    </Text>
                )}
            </View>

            {settledExpenses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No history</Text>

                    <Text style={styles.emptySubtitle}>Settled expenses will appear here.</Text>
                </View>
            ) : (
                <View style={styles.expenses}>
                    {settledExpenses.map((expense) => (
                        <View key={expense.id} style={styles.expense}>
                            <View style={styles.expenseInfo}>
                                <Text style={styles.expenseTitle}>{expense.title}</Text>

                                <Text style={styles.expensePaidBy}>
                                    Paid by {getPersonName(expense.paidBy)}
                                </Text>
                            </View>

                            <Text style={styles.expenseAmount}>
                                {getTotal(expense).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
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
        color: '#555',
    },

    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
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
    },
})
