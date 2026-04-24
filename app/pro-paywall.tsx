// Pro Paywall Screen - Subscription & Lifetime Unlock
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '🔌', text: 'Electrician Calculators', included: true },
  { icon: '📡', text: 'Conduit Fill Calculator (NEC)', included: true },
  { icon: '⚡', text: 'Voltage Drop Calculator', included: false },
  { icon: '🔥', text: 'Welding Parameter Calculator', included: false },
  { icon: '🚿', text: 'Plumbing Flow & Sizing', included: false },
  { icon: '💨', text: 'HVAC Duct Sizer (CFM)', included: false },
  { icon: '📊', text: 'Save & Export Results', included: false },
  { icon: '🚫', text: 'No Ads - Ever', included: false },
];

const PLANS = [
  { id: 'weekly', label: 'Weekly', price: '$2.99', period: '/week', popular: false },
  { id: 'monthly', label: 'Monthly', price: '$4.99', period: '/month', popular: true },
  { id: 'lifetime', label: 'Lifetime', price: '$14.99', period: 'one-time', popular: false },
];

export default function ProPaywall() {
  const [selected, setSelected] = useState('monthly');
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = () => {
    alert(`Proceeding to purchase ${PLANS.find(p => p.id === selected)?.label} plan...`);
    // TODO: Integrate In-App Purchase
  };

  const handleRestore = () => {
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      alert('No previous purchases found.');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PRO</Text>
        </View>
        <Text style={styles.title}>Unlock All Calculators</Text>
        <Text style={styles.subtitle}>Get every trade tool in one app. No ads, no limits.</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={[styles.featureText, !f.included && styles.featureDim]}>{f.text}</Text>
            <Text style={styles.featureCheck}>{f.included ? '✅' : '🔒'}</Text>
          </View>
        ))}
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selected === plan.id && styles.planCardSelected,
              plan.popular && styles.planPopular,
            ]}
            onPress={() => setSelected(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.planInfo}>
              <Text style={styles.planLabel}>{plan.label}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </View>
            <View style={[styles.radio, selected === plan.id && { borderColor: CONFIG => CONFIG.color || '#3498DB' }]}>
              {selected === plan.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchase Button */}
      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseText}>
          Start {PLANS.find(p => p.id === selected)?.label} Subscription
        </Text>
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
        <Text style={styles.restoreText}>{restoring ? 'Restoring...' : 'Restore Purchases'}</Text>
      </TouchableOpacity>

      {/* Legal */}
      <Text style={styles.legal}>
        Payment charged to your Apple ID. Subscription auto-renews unless canceled 24h before period end.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20 },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#333', letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A2E', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  featuresContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 16, padding: 18, marginBottom: 20 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  featureIcon: { fontSize: 20, marginRight: 12, width: 28 },
  featureText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  featureDim: { color: '#999' },
  featureCheck: { fontSize: 16 },
  plansContainer: { paddingHorizontal: 20, marginBottom: 6 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 11,
  },
  planCardSelected: { borderColor: '#3498DB', bg: '#F0F7FF' },
  planPopular: { position: 'relative', overflow: 'hidden' },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  popularText: { fontSize: 9, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  planInfo: { flex: 1 },
  planLabel: { fontSize: 17, fontWeight: '700', color: '#333' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  planPrice: { fontSize: 22, fontWeight: 'bold', color: '#3498DB' },
  planPeriod: { fontSize: 13, color: '#888', marginLeft: 4 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, bg: '#3498DB' },
  purchaseButton: {
    backgroundColor: '#3498DB',
    borderRadius: 14,
    paddingVertical: 17,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  restoreButton: { alignItems: 'center', paddingVertical: 14 },
  restoreText: { color: '#888', fontSize: 14, fontWeight: '500' },
  legal: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 20,
  },
});
