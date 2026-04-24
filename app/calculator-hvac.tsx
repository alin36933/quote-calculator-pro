// HVAC Duct Calculator - CFM, Velocity, Friction Loss
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CONFIG = {
  title: 'HVAC Duct Sizer',
  subtitle: 'CFM • Velocity • Friction',
  icon: '💨',
  color: '#9B59B6',
};

export default function CalculatorHVAC() {
  const [mode, setMode] = useState<'cfm' | 'velocity' | 'friction'>('cfm');
  const [ductWidth, setDuctWidth] = useState('');
  const [ductHeight, setDuctHeight] = useState('');
  const [velocity, setVelocity] = useState('');
  const [cfmInput, setCfmInput] = useState('');
  const [widthV, setWidthV] = useState('');
  const [heightV, setHeightV] = useState('');
  const [cfmF, setCfmF] = useState('');
  const [ductSize, setDuctSize] = useState('');
  const [frictionRate, setFrictionRate] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const calculateCFM = () => {
    if (!ductWidth || !ductHeight || !velocity) return alert('Please fill all fields');
    const w = parseFloat(ductWidth), h = parseFloat(ductHeight), v = parseFloat(velocity);
    if (w <= 0 || h <= 0 || v <= 0) return alert('Values must be > 0');
    const area = (w * h) / 144;
    const cfm = v * area;
    const friction = Math.pow(v / 4000, 2) * 0.08 * 100;
    setResults([
      `Duct Area: ${area.toFixed(3)} ft²`,
      `Air Flow: ${cfm.toFixed(1)} CFM`,
      `Friction Loss: ${friction.toFixed(4)} "WC per 100ft`,
      v > 900 ? '⚠️ High velocity!' : '✅ Velocity acceptable',
    ]);
    setHistory([`CFM: ${cfm.toFixed(1)}`, ...history].slice(0, 8));
  };

  const calculateVelocity = () => {
    if (!cfmInput || !widthV || !heightV) return alert('Please fill all fields');
    const c = parseFloat(cfmInput), w = parseFloat(widthV), h = parseFloat(heightV);
    if (c <= 0 || w <= 0 || h <= 0) return alert('Values must be > 0');
    const area = (w * h) / 144;
    const vel = c / area;
    setResults([`Duct Area: ${area.toFixed(3)} ft²`, `Velocity: ${vel.toFixed(1)} FPM`, vel > 900 ? '⚠️ High!' : '✅ Normal']);
    setHistory([`Vel: ${vel.toFixed(1)} FPM`, ...history].slice(0, 8));
  };

  const calculateFriction = () => {
    if (!cfmF || !ductSize || !frictionRate) return alert('Please fill all fields');
    const c = parseFloat(cfmF), d = parseFloat(ductSize), fr = parseFloat(frictionRate);
    if (c <= 0 || d <= 0 || fr <= 0) return alert('Values must be > 0');
    const totalLoss = fr * (c / 1000);
    setResults([`Est. Diameter: ${(d * 1.2).toFixed(2)}"`, `Pressure Drop: ${totalLoss.toFixed(3)} "WC`]);
    setHistory([`Loss: ${totalLoss.toFixed(3)} "WC`, ...history].slice(0, 8));
  };

  const Field = ({ label, value, onChange, hint, kb = 'decimal-pad' }: any) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={onChange} keyboardType={kb} placeholder="0" />
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );

  const Btn = ({ label, onPress }: any) => (
    <TouchableOpacity style={[s.btn, { backgroundColor: CONFIG.color }]} onPress={onPress}>
      <Text style={s.btnTxt}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.wrap}>
      <View style={[s.head, { backgroundColor: CONFIG.color }]}>
        <Text style={s.icon}>{CONFIG.icon}</Text>
        <Text style={s.title}>{CONFIG.title}</Text>
        <Text style={s.sub}>{CONFIG.subtitle}</Text>
      </View>

      <View style={s.tabs}>
        {(['cfm', 'velocity', 'friction'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabOn]} onPress={() => { setMode(m); setResults([]); }}>
            <Text style={[s.tabTxt, mode === m && s.tabTxtOn]}>{m === 'cfm' ? 'CFM' : m === 'velocity' ? 'Velocity' : 'Friction'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
        {mode === 'cfm' && (
          <>
            <Field label="Duct Width (in)" value={ductWidth} onChange={setDuctWidth} />
            <Field label="Duct Height (in)" value={ductHeight} onChange={setDuctHeight} />
            <Field label="Air Velocity (FPM)" value={velocity} onChange={setVelocity} hint="Rec: 600-900 FPM" />
            <Btn label="Calculate CFM" onPress={calculateCFM} />
          </>
        )}
        {mode === 'velocity' && (
          <>
            <Field label="Air Flow (CFM)" value={cfmInput} onChange={setCfmInput} />
            <Field label="Duct Width (in)" value={widthV} onChange={setWidthV} />
            <Field label="Duct Height (in)" value={heightV} onChange={setHeightV} />
            <Btn label="Calculate Velocity" onPress={calculateVelocity} />
          </>
        )}
        {mode === 'friction' && (
          <>
            <Field label="Air Flow (CFM)" value={cfmF} onChange={setCfmF} />
            <Field label="Round Duct Dia (in)" value={ductSize} onChange={setDuctSize} />
            <Field label='Friction Rate ("WC/100ft)' value={frictionRate} onChange={setFrictionRate} hint="Typical: 0.05-0.15" />
            <Btn label="Calculate Friction" onPress={calculateFriction} />
          </>
        )}

        {results.length > 0 && (
          <View style={s.resCard}>
            <Text style={s.resTitle}>Results</Text>
            {results.map((r, i) => <Text key={i} style={s.resLine}>{r}</Text>)}
          </View>
        )}

        {history.length > 0 && (
          <View style={s.histCard}>
            <Text style={s.histTitle}>History</Text>
            {history.map((h, i) => <Text key={i} style={s.histLine}>{h}</Text>)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, bg: '#F5F5F5' },
  head: { paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8, bg: '#FFF' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, bg: '#E8E8E8', alignItems: 'center' },
  tabOn: { bg: CONFIG => CONFIG.color },
  tabTxt: { fontSize: 13, color: '#666', fontWeight: '600' },
  tabTxtOn: { color: '#FFF' },
  scroll: { flex: 1 },
  field: { bg: '#FFF', borderRadius: 12, padding: 14, marginBottom: 12 },
  label: { fontSize: 14, color: '#333', fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, color: '#333' },
  hint: { fontSize: 12, color: '#999', marginTop: 6 },
  btn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  btnTxt: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  resCard: { bg: '#FFF', borderRadius: 12, padding: 18, marginBottom: 16, borderLeftWidth: 5, borderLeftColor: CONFIG => CONFIG.color },
  resTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  resLine: { fontSize: 15, color: '#444', marginVertical: 3, lineHeight: 22 },
  histCard: { bg: '#FAFAFA', borderRadius: 12, padding: 16, marginTop: 8 },
  histTitle: { fontSize: 15, fontWeight: 'bold', color: '#888', marginBottom: 8 },
  histLine: { fontSize: 13, color: '#AAA', marginVertical: 2 },
});
