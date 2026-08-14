import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { StatusBar } from 'expo-status-bar'
import { ExpenseProvider } from '../store/ExpenseContext'

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />

            <BottomSheetModalProvider>
                <KeyboardProvider>
                    <ExpenseProvider>
                        <Stack screenOptions={{ animation: 'ios_from_right', headerShown: false }}>
                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    animation: 'none',
                                }}
                            />

                            <Stack.Screen name="add-expense" />

                            <Stack.Screen name="edit-expense" />

                            <Stack.Screen name="debts" />

                            <Stack.Screen name="settlement-details" />
                        </Stack>
                    </ExpenseProvider>
                </KeyboardProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}
