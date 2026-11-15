import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProvider } from '@/context/AppContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTintColor: '#15803d',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="category/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin/add-product"
          options={{
            presentation: 'modal',
            title: 'પ્રોડક્ટ મેનેજમેન્ટ',
          }}
        />
        <Stack.Screen
          name="admin/stock-in"
          options={{
            presentation: 'modal',
            title: 'સ્ટોક ઇન / ખરીદી એન્ટ્રી',
          }}
        />
        <Stack.Screen
          name="admin/sale-out"
          options={{
            presentation: 'modal',
            title: 'વેચાણ એન્ટ્રી / સ્ટોક આઉટ',
          }}
        />
        <Stack.Screen
          name="admin/categories"
          options={{
            presentation: 'modal',
            title: 'કેટેગરી વ્યવસ્થાપન',
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'એડમિન લૉગિન / રોલ સ્વિચર',
          }}
        />
      </Stack>
    </>
  );
}
