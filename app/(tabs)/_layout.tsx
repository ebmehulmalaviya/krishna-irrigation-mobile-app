import React from 'react';
import { Tabs, Link } from 'expo-router';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { role } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTitleStyle: {
          color: theme.text,
          fontWeight: '800',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: 'હોમ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="rates"
        options={{
          title: 'પ્રોડક્ટ રેટ લિસ્ટ',
          tabBarLabel: 'ભાવ પત્રક',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pricetag' : 'pricetag-outline'}
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: 'એડમિન ડેશબોર્ડ & સ્ટોક',
          tabBarLabel: 'એડમિન',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="contact"
        options={{
          title: 'સંપર્ક & માહિતી',
          tabBarLabel: 'સંપર્ક',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'call' : 'call-outline'}
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15803d',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
