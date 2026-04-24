// Voltage Drop Calculator — NEC recommended max 3% for branch circuits, 5% total
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/styles';

const MATERIALS = [
  { label: 'Copper (CU)', value: 'cu', K: 12.9 },
  { label: 'Aluminum (AL)', value: 'al', K: 21.2 },
];

const PHASES = [
  { label: 'Single Phase', value: '1' },
  { label: 'Three Phase', value: '3' },
];

export default function VoltageDropCalculator() {
  const [material, setMaterial] = useState('cu');
  const [phase, setPhase] = useState('1');
  const [voltage, setVoltage] = useState('240');
  const [current, setCurrent] = useState('20');
  const [length, setLength] = useState('100'); // one-way length in feet
  const [wireSize, setWireSize] = useState('12');

  // Circular mils for common wire sizes
  const CIRCULAR_MILS: Record<string, number> = {
    '14': 4110, '12': 6530, '10': 10380, '8': 16510,
    '6': 41740, '4': 66370, '2': 105600, '1/0': 105600,
    '2/0': 133100, '3/0': 167800, '4/0': 211600,
    '250': 250000, '300': 300000, '350': 350000, '500': 500000,
  };

  const WIRE_SIZES = Object.keys(CIRCULAR_MILS);

  const [result, setResult] = useState<{
    vDrop: number;
    vDropPercent: number;
    supplyVoltage: number;
    loadVoltage: number;
    recommendation: string;
  } | null>(null);

  const calculate = () => {
    const V = parseFloat(voltage) || 240;
    const I = parseFloat(current) || 0;
    const L = parseFloat(length) || 0; // one-way feet
    const CM = CIRCULAR_MILS[wireSize];
    
    if (!CM) return;

    // Find K constant
    const matInfo = MATERIALS.find(m => m.value === material);
    const K = matInfo?.K || 12.9;

    // Voltage drop formula: VD = (2 × K × I × L) / CM for single phase
    // For three phase: VD = (√3 × K × I × L) / CM
    const isThreePhase = phase === '3';
    const multiplier = isThreePhase ? 1.732 : 2;
    const vDrop = (multiplier * K * I * L) / CM;
    const vDropPercent = (vDrop / V) * 100;
    const loadVoltage = V - vDrop;

    let recommendation = '';
    if (vDropPercent <= 2) {
      recommendation = 'Excellent! Well under NEC 3% recommendation.';
    } else if (vDropPercent <= 3) {
      recommendation = '✅ Acceptable — within NEC 3% branch circuit limit.';
    } else if (vDropPercent <= 5) {
      recommendation = '⚠️ Exceeds 3% but within 5% total limit. Consider upsizing.';
    } else if (vDropPercent <= 8) {
      recommendation = '❌ Exceeds NEC recommendations. Increase wire size.';
    } else {
      recommendation = '🔴 Critical voltage drop! Immediate wire upgrade required.';
    }

    setResult({ vDrop: Math.round(vDrop * 100) / 100, vDropPercent: Math.round(vDropPercent * 100) / 100, supplyVoltage: V, loadVoltage: Math.round(loadVoltage * 100) / 100, recommendation });
  };

  // Suggest minimum wire size to keep drop ≤3%
  const suggestWireSize = () => {
    const V = parseFloat(voltage) || 240;
    const I = parseFloat(current) || 0;
    const L = parseFloat(length) || 0;
    const matInfo = MATERIALS.find(m => m.value === material);
    const K = matInfo?.K || 12.9;
    const isThreePhase = phase === '3';
    const multiplier = isThreePhase ? 1.732 : 2;

    // Target: 3% voltage drop
    const targetVD = V * 0.03;
    const requiredCM = (multiplier * K * I * L) / targetVD;

    for (const ws of WIRE_SIZES) {
      if (CIRCULAR_MILS[ws] >= requiredCM) {
        setWireSize(ws);
        break;
      }
    }
    setResult(null); // recalculate with new size
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>⚡ Voltage Drop Calculator</Text>
        <Text style={styles.screenSubtitle}>NEC Recommendation: Max 3% Branch Circuit</Text>

        <View style={[styles.row, styles.section]}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.sectionTitle}>Supply Voltage (V)</Text>
            <TextInput style={styles.input} value={voltage} onChangeText={setVoltage} keyboardType="decimal-pad" placeholder="120/208/240/480" placeholderTextColor="#666" />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.sectionTitle}>Load Current (A)</Text>
            <TextInput style={styles.input} value={current} onChangeText={setCurrent} keyboardType="decimal-pad" placeholder="e.g., 20" placeholderTextColor="#666" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>One-Way Distance (feet)</Text>
          <TextInput style={styles.input} value={length} onChangeText={setLength} keyboardType="decimal-pad" placeholder="Distance from source to load" placeholderTextColor="#666" />
        </View>

        <View style={[styles.row, styles.section]}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.sectionTitle}>Material</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={material} onValueChange={(v) => { setMaterial(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
                {MATERIALS.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.sectionTitle}>Phase</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={phase} onValueChange={(v) => { setPhase(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
                {PHASES.map(p => <Picker.Item key={p.value} label={p.label} value={p.value} />)}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wire Size (AWG)</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={wireSize} onValueChange={(v) => { setWireSize(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
              {WIRE_SIZES.map(ws => <Picker.Item key={ws} label={`AWG ${ws}`} value={ws} />)}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={calculate} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={suggestWireSize} activeOpacity={0.7}>
            <Text style={[styles.buttonText, { color: '#007AFF' }]}>🔍 Auto-Suggest Size (≤3%)</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[
            styles.resultCard,
            result.vDropPercent > 5 ? { borderColor: '#FF3B30' } :
            result.vDropPercent > 3 ? { borderColor: '#FF9500' } : {}
          ]}>
            <Text style={styles.resultLabel}>Voltage Drop Result</Text>

            {/* Visual gauge */}
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <View style={{ width: 180, height: 90, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* Gauge arc background */}
                <Text style={{
                  fontSize: result.vDropPercent > 5 ? 42 : 36,
                  fontWeight: 'bold',
                  color: result.vDropPercent > 5 ? '#FF3B30' : result.vDropPercent > 3 ? '#FF9500' : '#34C759',
                }}>{result.vDropPercent}%</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>voltage drop</Text>
                
                {/* Color bar indicator */}
                <View style={{ width: 160, height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 8, overflow: 'hidden', flexDirection: 'row' }}>
                  <View style={{ width: '30%', height: '100%', backgroundColor: '#34C759' }} />
                  <View style={{ width: '23%', height: '100%', backgroundColor: '#FF9500' }} />
                  <View style={{ flex: 1, height: '100%', backgroundColor: '#FF3B30' }} />
                </View>
                {/* Needle */}
                <View style={{
                  position: 'absolute',
                  bottom: 18,
                  left: `${Math.min(result.vDropPercent / 10, 100)}%`,
                  width: 4,
                  height: 12,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  transform: [{ translateX: -2 }],
                }} />
              </View>
              
              {/* Legend */}
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: '#34C759' }}>● ≤3%</Text>
                <Text style={{ fontSize: 11, color: '#FF9500' }}>● 3-5%</Text>
                <Text style={{ fontSize: 11, color: '#FF3B30' }}>● >5%</Text>
              </View>
            </View>

            <View style={styles.resultGrid}>
              <View><Text style={styles.resultSubLabel}>Voltage Drop</Text><Text style={styles.resultSubValue}>{result.vDrop} V</Text></View>
              <View><Text style={styles.resultSubLabel}>Load Voltage</Text><Text style={styles.resultSubValue}>{result.loadVoltage} V</Text></View>
            </View>

            <View style={styles.infoBox}>
              <Text style={[styles.infoText, { fontSize: 13 }]}>
                {result.recommendation}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📐 Formula: VD = ({phase === '3' ? '√3' : '2'} × K × I × L) / CM
                {'\n'}K = {MATERIALS.find(m => m.value === material)?.label}, CM = {CIRCULAR_MILS[wireSize].toLocaleString()} cmils
              </Text>
            </View>
          </View>
        )}

        {/* Quick reference */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Common Scenarios</Text>
          {[['120V/15A/100ft/AWG14', '~5.8% ❌'], ['120V/20A/100ft/AWG12', '~3.3% ⚠️'], ['240V/30A/150ft/AWG10', '~1.8% ✅'], ['240V/40A/200ft/AWG8', '~1.6% ✅']].map(([scenario, verdict]) => (
            <View key={scenario} style={styles.referenceRow}>
              <Text style={styles.referenceLabel} numberOfLines={1}>{scenario}</Text>
              <Text style={styles.referenceValue}>{verdict}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';
