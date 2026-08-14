import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import type { Person } from '@/types/Person'
import { PEOPLE } from '../data/people'
import { useExpenses } from '../store/ExpenseContext'

export default function Debts() {
    const { expenses, settleExpenses } = useExpenses()

    const balances: Balance[] = PEOPLE.map((person) => ({ person, balance: 0 }))

    expenses
        .filter((expense) => !expense.settled)
        .forEach((expense) => {
            const total = Object.values(expense.shares).reduce((sum, share) => sum + share, 0)

            // The person who paid gets credit for the whole expense.
            balances.find((b) => b.person.id === expense.paidBy)!.balance += total

            // Everyone owes their own share.
            Object.entries(expense.shares).forEach(([personId, share]) => {
                balances.find((b) => b.person.id === personId)!.balance -= share
            })
        })

    const actions = calculatePayments(
        balances.filter((balance) => balance.balance !== 0).sort((a, b) => b.balance - a.balance),
    )
    type Balance = {
        person: Person
        balance: number
    }
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
                pushSorted(balances, { ...greatest, balance: newBalance })
            } else if (newBalance < 0) {
                actions.push({
                    from: smallest.person,
                    to: greatest.person,
                    amount: Math.abs(greatest.balance),
                })
                pushSorted(balances, { ...smallest, balance: newBalance })
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

            {balances.map(({ person, balance }) => {
                return (
                    <View key={person.id} style={styles.person}>
                        <Text style={styles.name}>{person.name}</Text>

                        <Text style={styles.balance}>
                            {balance > 0 ? `+${balance}` : balance.toString()}
                        </Text>
                    </View>
                )
            })}
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
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
    },

    person: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },

    name: {
        fontSize: 18,
        fontWeight: '600',
    },

    balance: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 32,
        marginBottom: 12,
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
