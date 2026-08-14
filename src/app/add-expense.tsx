import ShareAdjustment from '@/components/ShareAdjustment'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { PEOPLE } from '../data/people'
import { useExpenses } from '../store/ExpenseContext'

export default function AddExpense() {
    const [title, setTitle] = useState('')
    const [paidBy, setPaidBy] = useState(PEOPLE[0].id)

    const [shares, setShares] = useState<Record<string, string>>(
        Object.fromEntries(PEOPLE.map((person) => [person.id, '0'])),
    )
    const { addExpense } = useExpenses()

    const titleInputRef = useRef<TextInput>(null)
    const shareInputRefs = useRef<(TextInput | null)[]>([])

    const updateShare = (personId: string, value: string) => {
        setShares((current) => ({
            ...current,
            [personId]: value,
        }))
    }

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title.')
            return
        }

        const expense = {
            id: Date.now().toString(),
            title: title.trim(),
            paidBy,
            shares: Object.fromEntries(
                Object.entries(shares).map(([personId, value]) => [personId, Number(value)]),
            ),
            settled: false,
        }

        await addExpense(expense)

        router.back()
    }

    const total = Object.values(shares).reduce((sum, value) => sum + (Number(value) || 0), 0)

    return (
        <KeyboardAwareScrollView bottomOffset={50} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add Expense</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
                ref={titleInputRef}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Gasoline"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => {
                    shareInputRefs.current[0]?.focus()
                }}
            />

            <Text style={styles.label}>Paid by</Text>

            <View style={styles.people}>
                {PEOPLE.map((person) => (
                    <Pressable
                        key={person.id}
                        style={[styles.personButton, paidBy === person.id && styles.selectedPerson]}
                        onPress={() => setPaidBy(person.id)}
                    >
                        <Text
                            style={[
                                styles.personButtonText,
                                paidBy === person.id && styles.selectedPersonText,
                            ]}
                        >
                            {person.name}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.label}>Shares</Text>

            {PEOPLE.map((person, index) => (
                <View key={person.id} style={styles.shareRow}>
                    <Text style={styles.personName}>{person.name}</Text>

                    <TextInput
                        ref={(ref) => {
                            shareInputRefs.current[index] = ref
                        }}
                        style={styles.shareInput}
                        value={shares[person.id]}
                        onChangeText={(value) => updateShare(person.id, value)}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                        returnKeyType={index === PEOPLE.length - 1 ? 'done' : 'next'}
                        submitBehavior={index === PEOPLE.length - 1 ? 'blurAndSubmit' : 'submit'}
                        onSubmitEditing={() => {
                            const nextInput = shareInputRefs.current[index + 1]

                            if (nextInput) {
                                nextInput.focus()
                            }
                        }}
                    />
                </View>
            ))}

            <ShareAdjustment shares={shares} onChange={setShares} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{total}</Text>
            </View>

            <View style={styles.saveButton}>
                <Button title="Save" onPress={handleSave} />
            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingTop: 60,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 32,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 20,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },

    people: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    personButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
    },

    selectedPerson: {
        backgroundColor: '#000',
        borderColor: '#000',
    },

    personButtonText: {
        fontSize: 15,
    },

    selectedPersonText: {
        color: '#fff',
    },

    shareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    personName: {
        fontSize: 16,
    },

    shareInput: {
        width: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        textAlign: 'center',
    },

    saveButton: {
        marginTop: 32,
        marginBottom: 40,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },

    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
    },

    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
    },
})
