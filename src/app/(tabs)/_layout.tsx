import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#111',
                tabBarInactiveTintColor: '#999',

                tabBarStyle: {
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    bottom: 0,

                    height: 64,

                    borderTopEndRadius: 20,
                    borderTopStartRadius: 20,

                    borderWidth: 1,
                    borderColor: '#e5e5e5',

                    backgroundColor: '#fff',

                    elevation: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 6,
                },

                tabBarIconStyle: {
                    marginTop: 5,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Expenses',

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
