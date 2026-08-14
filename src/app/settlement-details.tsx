import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import ScreenHeader from '@/components/ScreenHeader'
import { PEOPLE } from '../data/people'
import { useExpenses } from '../store/ExpenseContext'

export default function SettlementDetails() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { expenses, settlementBatches } = useExpenses()

    const batch = settlementBatches.find((batch) => batch.id === id)

    if (!batch) {
        return (
            <View style={styles.notFound}>
                <Ionicons name="alert-circle-outline" size={40} color="#888" />

                <Text style={styles.notFoundTitle}>Settlement not found</Text>

                <Text style={styles.notFoundText}>This settlement may have been deleted.</Text>
            </View>
        )
    }

    const batchExpenses = expenses.filter((expense) => batch.expenseIds.includes(expense.id))

    const getPersonName = (personId: string) => {
        return PEOPLE.find((person) => person.id === personId)?.name ?? personId
    }

    const getExpenseTotal = (expense: (typeof expenses)[number]) => {
        return Object.values(expense.shares).reduce((sum, share) => sum + share, 0)
    }

    const total = batchExpenses.reduce((sum, expense) => sum + getExpenseTotal(expense), 0)

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="" />

            <View style={styles.header}>
                <Ionicons name="checkmark-circle" size={44} color="#111" />

                <Text style={styles.title}>Settlement complete</Text>

                <Text style={styles.date}>{formatDate(batch.createdAt)}</Text>

                <Text style={styles.time}>{formatTime(batch.createdAt)}</Text>
            </View>

            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total expenses</Text>

                <Text style={styles.totalAmount}>{total.toLocaleString()}</Text>

                <Text style={styles.totalInfo}>
                    {batchExpenses.length} {batchExpenses.length === 1 ? 'expense' : 'expenses'} ·{' '}
                    {batch.payments.length} {batch.payments.length === 1 ? 'payment' : 'payments'}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Expenses</Text>

            <View style={styles.card}>
                {batchExpenses.map((expense, index) => (
                    <View
                        key={expense.id}
                        style={[styles.expense, index < batchExpenses.length - 1 && styles.divider]}
                    >
                        <View style={styles.expenseInfo}>
                            <Text style={styles.expenseTitle}>{expense.title}</Text>

                            <Text style={styles.expensePaidBy}>
                                Paid by {getPersonName(expense.paidBy)}
                            </Text>
                        </View>

                        <Text style={styles.expenseAmount}>
                            {getExpenseTotal(expense).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Payments</Text>

            <View style={styles.card}>
                {batch.payments.map((payment, index) => (
                    <View
                        key={`${payment.from}-${payment.to}-${index}`}
                        style={[
                            styles.payment,
                            index < batch.payments.length - 1 && styles.divider,
                        ]}
                    >
                        <View style={styles.paymentPerson}>
                            <View style={styles.personIcon}>
                                <Ionicons name="person-outline" size={16} color="#555" />
                            </View>

                            <Text style={styles.paymentName}>{getPersonName(payment.from)}</Text>
                        </View>

                        <Ionicons name="arrow-forward" size={18} color="#999" />

                        <View style={styles.paymentPerson}>
                            <Text style={styles.paymentName}>{getPersonName(payment.to)}</Text>

                            <View style={styles.personIcon}>
                                <Ionicons name="person-outline" size={16} color="#555" />
                            </View>
                        </View>

                        <Text style={styles.paymentAmount}>{payment.amount.toLocaleString()}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Ionicons name="lock-closed-outline" size={16} color="#999" />

                <Text style={styles.footerText}>
                    This settlement is complete and cannot be edited.
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 50,
        backgroundColor: '#f7f7f7',
    },

    header: {
        alignItems: 'center',
        marginBottom: 24,
    },

    title: {
        marginTop: 12,
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
    },

    date: {
        marginTop: 6,
        fontSize: 15,
        color: '#666',
    },

    time: {
        marginTop: 2,
        fontSize: 13,
        color: '#999',
    },

    totalCard: {
        padding: 22,
        borderRadius: 18,
        backgroundColor: '#111',
        alignItems: 'center',
    },

    totalLabel: {
        fontSize: 14,
        color: '#aaa',
    },

    totalAmount: {
        marginTop: 6,
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },

    totalInfo: {
        marginTop: 6,
        fontSize: 13,
        color: '#aaa',
    },

    sectionTitle: {
        marginTop: 28,
        marginBottom: 10,
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    card: {
        overflow: 'hidden',
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e9e9e9',
    },

    expense: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },

    expenseInfo: {
        flex: 1,
    },

    expenseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },

    expensePaidBy: {
        marginTop: 4,
        fontSize: 13,
        color: '#888',
    },

    expenseAmount: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },

    payment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 10,
    },

    paymentPerson: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    personIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    paymentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

    paymentAmount: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },

    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 28,
    },

    footerText: {
        fontSize: 12,
        color: '#999',
    },

    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f7f7f7',
    },

    notFoundTitle: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: '700',
    },

    notFoundText: {
        marginTop: 6,
        fontSize: 14,
        color: '#777',
    },
})
