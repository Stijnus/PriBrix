import { Bell, House, Package, Search, Settings2 } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { theme } from '@/src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.neutral[200],
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: theme.colors.neutral[900],
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: theme.typography.fontFamilySemiBold,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="my-lego"
        options={{
          title: 'My LEGO',
          tabBarIcon: ({ color }) => <Package color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings2 color={color} size={22} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
