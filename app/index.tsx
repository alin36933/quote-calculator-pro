import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

interface CalculatorItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  isPro: boolean;
}

const calculators: CalculatorItem[] = [
  {
    id: 'wire-gauge',
    title: 'Wire Gauge Calculator',
    subtitle: 'AWG sizing, ampacity & voltage drop',
    icon: 'flash-outline',
    color: '#f59e0b',
    isPro: false,
  },
  {
    id: 'conduit-fill',
    title: 'Conduit Fill Calculator',
    subtitle: 'NEC standard conduit fill rates',
    icon: 'grid-outline',
    color: '#3b82f6',
    isPro: true,
  },
  {
    id: 'voltage-drop',
    title: 'Voltage Drop Calc',
    subtitle: 'Calculate voltage drop per NEC',
    icon: 'trending-down-outline',
    color: '#ef4444',
    isPro: true,
  },
  {
    id: 'welding-param',
    title: 'Welding Parameter Calc',
    subtitle: 'Amperage, gas flow & wire speed',
    icon: 'flame-outline',
    color: '#f97316',
    isPro: true,
  },
  {
    id: 'pipe-sizing',
    title: 'Pipe Sizing Calculator',
    subtitle: 'Flow rate, velocity & pressure',
    icon: 'water-outline',
    color: '#06b6d4',
    isPro: true,
  },
  {
    id: 'hvac-duct',
    title: 'HVAC Duct Calculator',
    subtitle: 'CFM, friction & duct sizing',
    icon: 'cloud-outline',
    color: '#8b5cf6',
    isPro: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check premium status from storage (simplified)
    setIsPremium(false);
  }, []);

  const handlePress = (calc: CalculatorItem) => {
    if (calc.isPro && !isPremium) {
      router.push('/premium');
      return;
    }
    router.push({
      pathname: '/calculator/[id]',
      params: { id: calc.id, title: calc.title },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TradeCalc Pro</Text>
          <Text style={styles.subtitle}>Professional Trade Calculators</Text>
        </View>

        {/* Pro Banner - show when not premium */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.proBanner}
            onPress={() => router.push('/premium')}
            activeOpacity={0.8}
          >
            <View style={styles.proBannerLeft}>
              <Ionicons name="diamond" size={24} color="#fbbf24" />
              <View>
                <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                <Text style={styles.proBannerSub}>Unlock all 6 calculators</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
        )}

        {/* Calculators Grid */}
        <View style={styles.grid}>
          {calculators.map((calc) => (
            <TouchableOpacity
              key={calc.id}
              style={[
                styles.card,
                calc.isPro && !isPremium && styles.lockedCard,
              ]}
              onPress={() => handlePress(calc)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: calc.color + '20' }]}>
                <Ionicons name={calc.icon as any} size={28} color={calc.color} />
                {calc.isPro && !isPremium && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={12} color="#64748b" />
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{calc.title}</Text>
              <Text style={styles.cardSubtitle}>{calc.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TradeCalc Pro v1.0</Text>
          <Text style={styles.footerSub}>Built for professionals</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '400',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
  },
  proBannerSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockedCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 5,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#475569',
  },
  footerSub: {
    fontSize: 11,
    color: '#334155',
    marginTop: 4,
  },
});
