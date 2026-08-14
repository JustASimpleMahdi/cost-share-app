import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'

export default function BackButton() {
    return (
        <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            hitSlop={10}
        >
            <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e9e9e9',
    },

    pressed: {
        opacity: 0.6,
    },
})
