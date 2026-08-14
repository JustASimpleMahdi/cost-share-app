import { Stack } from 'expo-router'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { ExpenseProvider } from '../store/ExpenseContext'

export default function Layout() {
    return (
        <KeyboardProvider>
            <ExpenseProvider>
                <Stack />
            </ExpenseProvider>
        </KeyboardProvider>
    )
}
