import { FontAwesome6 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral[50],
          borderTopColor: colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <FontAwesome6 name="magnifying-glass" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-lego"
        options={{
          title: 'My LEGO',
          tabBarIcon: ({ color }) => <FontAwesome6 name="layer-group" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <FontAwesome6 name="bell" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome6 name="gear" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
