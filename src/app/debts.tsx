import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import type { Cost } from '@/types/Cost'
import type { Person } from '@/types/Person'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { PEOPLE } from '../data/people'
import { useExpenses } from '../store/ExpenseContext'

type Balance = {
    person: Person
    balance: number
    paid: number
    share: number
    calculations: {
        expense: Cost
        amount: number
    }[]
}

export default function Debts() {
    const { expenses, settleExpenses } = useExpenses()
    const [expandedPeople, setExpandedPeople] = useState<Set<string>>(new Set())
    const togglePerson = (personId: string) => {
        setExpandedPeople((current) => {
            const next = new Set(current)

            if (next.has(personId)) {
                next.delete(personId)
            } else {
                next.add(personId)
            }

            return next
        })
    }
    const currentExpenses = expenses.filter((expense) => !expense.settled)

    const balances: Balance[] = PEOPLE.map((person) => ({
        person,
        balance: 0,
        paid: 0,
        share: 0,
        calculations: [],
    }))

    currentExpenses.forEach((expense) => {
        const total = Object.values(expense.shares).reduce((sum, share) => sum + share, 0)

        const paidBalance = balances.find((balance) => balance.person.id === expense.paidBy)

        if (paidBalance) {
            paidBalance.balance += total
            paidBalance.paid += total

            paidBalance.calculations.push({
                expense,
                amount: total,
            })
        }

        Object.entries(expense.shares).forEach(([personId, share]) => {
            const personBalance = balances.find((balance) => balance.person.id === personId)

            if (!personBalance) {
                return
            }

            personBalance.balance -= share
            personBalance.share += share

            // If this person also paid the expense, combine
            // the calculation into one net value for that expense.
            const existingCalculation = personBalance.calculations.find(
                (calculation) => calculation.expense.id === expense.id,
            )

            if (existingCalculation) {
                existingCalculation.amount -= share
            } else {
                personBalance.calculations.push({
                    expense,
                    amount: -share,
                })
            }
        })
    })

    const actions = calculatePayments(
        balances.filter((balance) => balance.balance !== 0).sort((a, b) => b.balance - a.balance),
    )

    function calculatePayments(balances: Balance[]) {
        const actions: { from: Person; to: Person; amount: number }[] = []

        const pushSorted = (arr: Balance[], balance: Balance) => {
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i].balance

                if (balance.balance >= element) {
                    arr.splice(i, 0, { ...balance, balance: balance.balance })
                    return
                }
            }

            arr.push({ ...balance, balance: balance.balance })
        }

        const recursion = () => {
            if (balances.length < 2) return

            const greatest = balances.shift()!
            const smallest = balances.pop()!

            const newBalance = greatest.balance + smallest.balance

            if (newBalance > 0) {
                actions.push({
                    from: smallest.person,
                    to: greatest.person,
                    amount: Math.abs(smallest.balance),
                })

                pushSorted(balances, {
                    ...greatest,
                    balance: newBalance,
                })
            } else if (newBalance < 0) {
                actions.push({
                    from: smallest.person,
                    to: greatest.person,
                    amount: Math.abs(greatest.balance),
                })

                pushSorted(balances, {
                    ...smallest,
                    balance: newBalance,
                })
            } else {
                actions.push({
                    from: smallest.person,
                    to: greatest.person,
                    amount: Math.abs(smallest.balance),
                })
            }

            recursion()
        }

        recursion()

        return actions
    }

    const handleSettle = () => {
        Alert.alert(
            'Settle debts',
            'Are you sure? Current expenses will no longer be included in debt calculations.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Settle',
                    style: 'destructive',
                    onPress: settleExpenses,
                },
            ],
        )
    }

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Debts</Text>

            <Text style={styles.sectionDescription}>
                See how everyone's balance is calculated from the current expenses.
            </Text>

            <View style={styles.balances}>
                {balances.map((balance) => {
                    const isPositive = balance.balance > 0
                    const isNegative = balance.balance < 0
                    const expanded = expandedPeople.has(balance.person.id)

                    return (
                        <Pressable
                            key={balance.person.id}
                            style={styles.personCard}
                            onPress={() => togglePerson(balance.person.id)}
                        >
                            <View style={styles.personHeader}>
                                <View style={styles.personInfo}>
                                    <Text style={styles.name}>{balance.person.name}</Text>
                                </View>

                                <View style={styles.balanceRight}>
                                    <Text
                                        style={[
                                            styles.balance,
                                            isPositive && styles.positiveText,
                                            isNegative && styles.negativeText,
                                        ]}
                                    >
                                        {isPositive ? '+' : ''}
                                        {balance.balance.toLocaleString()}
                                    </Text>

                                    <Ionicons
                                        name={expanded ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#999"
                                    />
                                </View>
                            </View>

                            {expanded && (
                                <View>
                                    <View style={styles.divider} />

                                    <View style={styles.summaryRow}>
                                        <View>
                                            <Text style={styles.summaryLabel}>Paid</Text>
                                            <Text style={styles.summaryValue}>
                                                {balance.paid.toLocaleString()}
                                            </Text>
                                        </View>

                                        <Text style={styles.operator}>−</Text>

                                        <View>
                                            <Text style={styles.summaryLabel}>Share</Text>
                                            <Text style={styles.summaryValue}>
                                                {balance.share.toLocaleString()}
                                            </Text>
                                        </View>

                                        <Text style={styles.operator}>=</Text>

                                        <View style={styles.balanceResult}>
                                            <Text style={styles.summaryLabel}>Balance</Text>
                                            <Text
                                                style={[
                                                    styles.summaryValue,
                                                    isPositive && styles.positiveText,
                                                    isNegative && styles.negativeText,
                                                ]}
                                            >
                                                {balance.balance.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    {balance.calculations.length > 0 && (
                                        <View style={styles.calculations}>
                                            <Text style={styles.calculationTitle}>Calculation</Text>

                                            {balance.calculations.map((calculation) => (
                                                <View
                                                    key={calculation.expense.id}
                                                    style={styles.calculationRow}
                                                >
                                                    <Text
                                                        style={styles.calculationExpense}
                                                        numberOfLines={1}
                                                    >
                                                        {calculation.expense.title}
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            styles.calculationAmount,
                                                            calculation.amount > 0 &&
                                                                styles.positiveText,
                                                            calculation.amount < 0 &&
                                                                styles.negativeText,
                                                        ]}
                                                    >
                                                        {calculation.amount > 0 ? '+' : ''}
                                                        {calculation.amount.toLocaleString()}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </Pressable>
                    )
                })}
            </View>

            <Text style={styles.sectionTitle}>Payments</Text>

            {actions.length > 0 ? (
                <>
                    {actions.map((action, index) => (
                        <View key={action.from.id + action.to.id + index} style={styles.action}>
                            <Text style={styles.fromName}>{action.from.name}</Text>

                            <View style={styles.arrowContainer}>
                                <Text style={styles.arrow}>→</Text>
                            </View>

                            <Text style={styles.toName}>{action.to.name}</Text>

                            <Text style={styles.actionAmount}>{action.amount}</Text>
                        </View>
                    ))}

                    <Pressable style={styles.settleButton} onPress={handleSettle}>
                        <Text style={styles.settleButtonText}>Settle debts</Text>
                    </Pressable>
                </>
            ) : (
                <View style={styles.noDebts}>
                    <Text style={styles.noDebtsIcon}>✓</Text>

                    <Text style={styles.noDebtsTitle}>No debts</Text>

                    <Text style={styles.noDebtsText}>Everyone is settled up.</Text>
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: '#f7f7f7',
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111',
    },

    sectionDescription: {
        marginTop: 6,
        marginBottom: 20,
        fontSize: 14,
        lineHeight: 20,
        color: '#777',
    },

    balances: {
        gap: 12,
    },

    personCard: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e9e9e9',
    },
    personInfo: {
        flex: 1,
    },

    balanceRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    personHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    balanceLabel: {
        marginTop: 4,
        fontSize: 13,
        color: '#777',
    },

    balance: {
        fontSize: 22,
        fontWeight: '700',
    },

    positiveText: {
        color: '#16803c',
    },

    negativeText: {
        color: '#c0392b',
    },

    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },

    summaryRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },

    summaryLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },

    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },

    operator: {
        fontSize: 16,
        color: '#aaa',
        paddingBottom: 2,
    },

    balanceResult: {
        alignItems: 'flex-end',
    },

    calculations: {
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f7f7f7',
    },

    calculationTitle: {
        marginBottom: 8,
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },

    calculationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },

    calculationExpense: {
        flex: 1,
        marginRight: 12,
        fontSize: 13,
        color: '#555',
    },

    calculationAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 32,
        marginBottom: 12,
        color: '#111',
    },

    action: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    fromName: {
        width: 100,
        fontSize: 16,
        fontWeight: '600',
    },

    arrowContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrow: {
        fontSize: 20,
        color: '#888',
    },

    toName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    actionAmount: {
        width: 70,
        textAlign: 'right',
        fontSize: 17,
        fontWeight: '700',
    },

    settleButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#000',
        alignItems: 'center',
    },

    settleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    noDebts: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    noDebtsIcon: {
        fontSize: 32,
        marginBottom: 10,
    },

    noDebtsTitle: {
        fontSize: 20,
        fontWeight: '700',
    },

    noDebtsText: {
        marginTop: 6,
        fontSize: 14,
        color: '#777',
    },
})
