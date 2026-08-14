import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Props = {
    title: string
    subtitle?: string
}

export default function ScreenHeader({ title, subtitle }: Props) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                hitSlop={10}
            >
                <Ionicons name="chevron-back" size={24} color="#111" />
            </Pressable>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>

                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },

    backButton: {
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

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#777',
    },
})
