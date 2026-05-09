import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'TradeCalc Pro' }}
        />
        <Stack.Screen
          name="pro-paywall"
          options={{ title: 'Go Premium' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="calculator-electrician"
          options={{ title: 'Wire Gauge Calculator' }}
        />
        <Stack.Screen
          name="calculator-conduit"
          options={{ title: 'Conduit Fill' }}
        />
        <Stack.Screen
          name="calculator-voltagedrop"
          options={{ title: 'Voltage Drop' }}
        />
        <Stack.Screen
          name="calculator-welding"
          options={{ title: 'Welding Parameters' }}
        />
        <Stack.Screen
          name="calculator-plumbing"
          options={{ title: 'Pipe Sizing' }}
        />
        <Stack.Screen
          name="calculator-hvac"
          options={{ title: 'HVAC Duct' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
