import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetTextInput,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Parser } from 'expr-eval'
import { PEOPLE } from '../data/people'

type Props = {
    shares: Record<string, string>
    onChange: (shares: Record<string, string>) => void
}

export default function ShareAdjustment({ shares, onChange }: Props) {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const [amount, setAmount] = useState('')
    const [selectedPeople, setSelectedPeople] = useState<string[]>([])
    const [operation, setOperation] = useState<'add' | 'subtract'>('add')

    const openSheet = () => {
        bottomSheetRef.current?.present()
    }

    const closeSheet = () => {
        bottomSheetRef.current?.dismiss()
    }

    const togglePerson = (personId: string) => {
        setSelectedPeople((current) =>
            current.includes(personId)
                ? current.filter((id) => id !== personId)
                : [...current, personId],
        )
    }

    const applyAdjustment = () => {
        if (!amount.trim() || selectedPeople.length === 0) {
            return
        }

        let adjustment: number

        try {
            adjustment = Parser.evaluate(amount)

            if (!Number.isFinite(adjustment) || adjustment <= 0) {
                return
            }
        } catch {
            return
        }

        const updatedShares = { ...shares }

        selectedPeople.forEach((personId) => {
            const currentValue = Number(updatedShares[personId]) || 0

            updatedShares[personId] = String(
                operation === 'add'
                    ? currentValue + adjustment
                    : Math.max(0, currentValue - adjustment),
            )
        })

        onChange(updatedShares)

        setAmount('')
        closeSheet()
    }

    return (
        <>
            <Pressable style={styles.openButton} onPress={openSheet}>
                <Text style={styles.openButtonText}>+ Bulk adjustment</Text>
            </Pressable>

            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={['60%']}
                enablePanDownToClose
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
                )}
            >
                <BottomSheetView style={styles.sheet}>
                    <Text style={styles.title}>Bulk adjustment</Text>

                    <View style={styles.operationRow}>
                        <Pressable
                            style={[
                                styles.operationButton,
                                operation === 'add' && styles.selectedOperation,
                            ]}
                            onPress={() => setOperation('add')}
                        >
                            <Text
                                style={[
                                    styles.operationText,
                                    operation === 'add' && styles.selectedOperationText,
                                ]}
                            >
                                + Add
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.operationButton,
                                operation === 'subtract' && styles.selectedOperation,
                            ]}
                            onPress={() => setOperation('subtract')}
                        >
                            <Text
                                style={[
                                    styles.operationText,
                                    operation === 'subtract' && styles.selectedOperationText,
                                ]}
                            >
                                − Subtract
                            </Text>
                        </Pressable>
                    </View>

                    <BottomSheetTextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numbers-and-punctuation"
                        placeholder="Amount or expression"
                    />

                    <Text style={styles.label}>Select people</Text>

                    <View style={styles.people}>
                        {PEOPLE.map((person) => {
                            const selected = selectedPeople.includes(person.id)

                            return (
                                <Pressable
                                    key={person.id}
                                    style={[styles.personButton, selected && styles.selectedPerson]}
                                    onPress={() => togglePerson(person.id)}
                                >
                                    <Text
                                        style={[
                                            styles.personText,
                                            selected && styles.selectedPersonText,
                                        ]}
                                    >
                                        {selected ? '✓ ' : ''}
                                        {person.name}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>

                    <Pressable style={styles.applyButton} onPress={applyAdjustment}>
                        <Text style={styles.applyButtonText}>Apply</Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
        </>
    )
}

const styles = StyleSheet.create({
    openButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },

    openButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },

    sheet: {
        flex: 1,
        padding: 24,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
    },

    operationRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    operationButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
    },

    selectedOperation: {
        backgroundColor: '#000',
        borderColor: '#000',
    },

    operationText: {
        fontWeight: '600',
    },

    selectedOperationText: {
        color: '#fff',
    },

    amountInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },

    people: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    personButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
    },

    selectedPerson: {
        backgroundColor: '#000',
        borderColor: '#000',
    },

    personText: {
        fontSize: 14,
    },

    selectedPersonText: {
        color: '#fff',
    },

    applyButton: {
        marginTop: 24,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#000',
        alignItems: 'center',
    },

    applyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
})
