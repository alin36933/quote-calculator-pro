// Settings Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';

export default function Settings() {
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={s.title}>Settings</Text>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
        <Section title="GENERAL">
          <Row icon="🌐" label="Units" value="Imperial (US)" />
          <Row icon="🔔" label="Notifications" right={<Switch value={true} />} last />
        </Section>

        <Section title="DATA">
          <Row icon="💾" label="Saved Calculations" value="12" />
          <TouchableOpacity style={s.row} onPress={() => alert('Exporting...')}>
            <Text style={s.rowIcon}>📤</Text>
            <Text style={s.rowLabel}>Export All Data</Text>
            <Text style={s.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => alert('Are you sure?')}>
            <Text style={s.rowIcon}>🗑️</Text>
            <Text style={[s.rowLabel, { color: '#E74C3C' }]}>Clear All Data</Text>
          </TouchableOpacity>
        </Section>

        <Section title="SUBSCRIPTION">
          <TouchableOpacity style={s.row} onPress={() => alert('Manage subscription...')}>
            <Text style={s.rowIcon}>👑</Text>
            <Text style={s.rowLabel}>Manage Subscription</Text>
            <Text style={s.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => alert('Restoring...')}>
            <Text style={s.rowIcon}>🔄</Text>
            <Text style={s.rowLabel}>Restore Purchases</Text>
          </TouchableOpacity>
        </Section>

        <Section title="ABOUT">
          <Row icon="ℹ️" label="Version" value="1.0.0 (Build 1)" />
          <Row icon="⭐" label="Rate This App" right={<Text style={s.rowArrow}>›</Text>} />
          <Row icon="📋" label="Privacy Policy" right={<Text style={s.rowArrow}>›</Text>} last />
        </Section>

        <Text style={s.footer}>
          TradeCalc Pro v1.0.0{'\n'}
          Made with ❤️ for trade professionals
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, right, last }: { icon?: string; label: string; value?: string; right?: any; last?: boolean }) {
  return (
    <View style={[s.row, !last && { borderBottomWidth: 1 }, last && { borderBottomWidth: 0 }]}>
      {icon && <Text style={s.rowIcon}>{icon}</Text>}
      <Text style={s.rowLabel}>{label}</Text>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {right || (value ? null : <Text style={s.rowArrow}>›</Text>)}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, bg: '#F5F5F5' },
  head: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, bg: '#FFF' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A2E' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  sectionCard: { bg: '#FFF', borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomColor: '#F0F0F0', borderBottomWidth: 1 },
  rowIcon: { fontSize: 19, marginRight: 13, width: 28 },
  rowLabel: { flex: 1, fontSize: 16, color: '#333', fontWeight: '500' },
  rowValue: { fontSize: 15, color: '#888' },
  rowArrow: { fontSize: 18, color: '#CCC' },
  footer: { textAlign: 'center', color: '#AAA', fontSize: 12, marginTop: 10, marginBottom: 30, lineHeight: 20 },
});
