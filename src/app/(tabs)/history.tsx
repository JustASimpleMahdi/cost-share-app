import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useExpenses } from '../../store/ExpenseContext'

export default function History() {
    const { expenses, settlementBatches } = useExpenses()

    const getBatchExpenses = (expenseIds: string[]) => {
        return expenses.filter((expense) => expenseIds.includes(expense.id))
    }

    const getExpenseTotal = (expenseIds: string[]) => {
        return getBatchExpenses(expenseIds).reduce((total, expense) => {
            return total + Object.values(expense.shares).reduce((sum, share) => sum + share, 0)
        }, 0)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>

                {settlementBatches.length > 0 && (
                    <Text style={styles.subtitle}>
                        {settlementBatches.length}{' '}
                        {settlementBatches.length === 1 ? 'settlement' : 'settlements'}
                    </Text>
                )}
            </View>

            {settlementBatches.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>✓</Text>

                    <Text style={styles.emptyTitle}>No history</Text>

                    <Text style={styles.emptySubtitle}>
                        Your completed settlements will appear here.
                    </Text>
                </View>
            ) : (
                <View style={styles.batches}>
                    {[...settlementBatches].reverse().map((batch) => {
                        const batchExpenses = getBatchExpenses(batch.expenseIds)

                        const total = getExpenseTotal(batch.expenseIds)

                        return (
                            <Pressable
                                key={batch.id}
                                style={({ pressed }) => [
                                    styles.batch,
                                    pressed && styles.batchPressed,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/settlement-details',
                                        params: {
                                            id: batch.id,
                                        },
                                    })
                                }
                            >
                                <View style={styles.batchMain}>
                                    <Text style={styles.batchDate}>
                                        {formatDate(batch.createdAt)}
                                    </Text>

                                    <Text style={styles.batchInfo}>
                                        {batchExpenses.length}{' '}
                                        {batchExpenses.length === 1 ? 'expense' : 'expenses'} ·{' '}
                                        {batch.payments.length}{' '}
                                        {batch.payments.length === 1 ? 'payment' : 'payments'}
                                    </Text>
                                </View>

                                <View style={styles.batchRight}>
                                    <Text style={styles.batchTotal}>{total.toLocaleString()}</Text>

                                    <Text style={styles.chevron}>›</Text>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
        backgroundColor: '#f7f7f7',
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

    batches: {
        gap: 10,
    },

    batch: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e9e9e9',
    },

    batchPressed: {
        opacity: 0.7,
    },

    batchMain: {
        flex: 1,
    },

    batchDate: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111',
    },

    batchInfo: {
        marginTop: 5,
        fontSize: 13,
        color: '#888',
    },

    batchRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    batchTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    chevron: {
        fontSize: 24,
        color: '#999',
    },

    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },

    emptyIcon: {
        fontSize: 32,
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    emptySubtitle: {
        marginTop: 8,
        maxWidth: 280,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        color: '#777',
    },
})
