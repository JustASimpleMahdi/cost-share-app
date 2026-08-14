import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { ExpenseProvider } from '../store/ExpenseContext'

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <KeyboardProvider>
                    <ExpenseProvider>
                        <Stack>
                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    headerShown: false,
                                }}
                            />
                        </Stack>
                    </ExpenseProvider>
                </KeyboardProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}
