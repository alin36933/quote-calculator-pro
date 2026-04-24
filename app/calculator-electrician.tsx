// Wire Gauge / Ampacity Calculator - NEC 2023 Standards
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/styles';

const MATERIALS = [
  { label: 'Copper (CU)', value: 'cu', tempCoeff: 1.0 },
  { label: 'Aluminum (AL)', value: 'al', tempCoeff: 0.84 },
];

const INSULATION_TYPES = [
  { label: '60°C (TW, UF)', value: '60', maxAmp: 60 },
  { label: '75°C (RHW, THWN)', value: '75', maxAmp: 75 },
  { label: '90°C (THHN, XHHW)', value: '90', maxAmp: 90 },
];

// NEC Table 310.16 ampacity data (simplified key values)
const AMPACITY_DATA: Record<string, Record<string, number>> = {
  cu: {
    '14': '15', '12': '20', '10': '30', '8': '55', '6': '65',
    '4': '85', '3': '100', '2': '115', '1': '130',
    '1/0': '150', '2/0': '175', '3/0': '200', '4/0': '230',
    '250': '255', '300': '285', '350': '310', '500': '380',
  },
  al: {
    '14': '12', '12': '15', '10': '25', '8': '40', '6': '50',
    '4': '65', '3': '75', '2': '90', '1': '100',
    '1/0': '120', '2/0': '135', '3/0': '155', '4/0': '180',
    '250': '205', '300': '230', '350': '250', '500': '310',
  },
};

const WIRE_GAUGES = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '500'];

export default function ElectricianCalculator() {
  const [material, setMaterial] = useState('cu');
  const [gauge, setGauge] = useState('12');
  const [insulation, setInsulation] = useState('75');
  const [ambientTemp, setAmbientTemp] = useState('30');
  const [loadCurrent, setLoadCurrent] = useState('');
  const [result, setResult] = useState<{ gauge: string; amps: string; ok: boolean } | null>(null);

  // Ambient temperature correction factors (NEC Table 310.15(B)(1))
  const getTempFactor = (temp: number, insulationRating: number): number => {
    if (insulationRating === 90) {
      if (temp <= 26) return 1.04; if (temp <= 30) return 1.00; if (temp <= 35) return 0.96;
      if (temp <= 40) return 0.91; if (temp <= 45) return 0.87; if (temp <= 50) return 0.82;
      return 0.82;
    } else if (insulationRating === 75) {
      if (temp <= 31) return 1.04; if (temp <= 35) return 1.00; if (temp <= 40) return 0.94;
      if (temp <= 45) return 0.88; if (temp <= 50) return 0.82; if (temp <= 55) return 0.75;
      return 0.75;
    }
    if (temp <= 36) return 1.04; if (temp <= 40) return 1.00; if (temp <= 45) return 0.95;
    if (temp <= 50) return 0.91; if (temp <= 55) return 0.87; if (temp <= 60) return 0.82;
    return 0.82;
  };

  const calculateAmpacity = () => {
    const baseAmp = parseInt(AMPACITY_DATA[material][gauge] || '0');
    const insMax = parseInt(insulation);
    const temp = parseFloat(ambientTemp) || 30;
    const factor = getTempFactor(temp, insMax);
    const adjustedAmp = Math.round(baseAmp * factor * 10) / 10;

    setResult({ gauge, amps: adjustedAmp.toString(), ok: true });
  };

  const findMinWireSize = () => {
    const load = parseFloat(loadCurrent);
    if (!load || load <= 0) return;
    
    const insMax = parseInt(insulation);
    const temp = parseFloat(ambientTemp) || 30;
    const factor = getTempFactor(temp, insMax);

    for (const g of WIRE_GAUGES) {
      const baseAmp = parseInt(AMPACITY_DATA[material][g] || '0');
      if (Math.round(baseAmp * factor) >= load) {
        setResult({ gauge: g, amps: Math.round(baseAmp * factor).toString(), ok: true });
        return;
      }
    }

    setResult({ gauge: '?', amps: '-', ok: false });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>⚡ Electrician Calculator</Text>
        <Text style={styles.screenSubtitle}>NEC 2023 — Wire Ampacity & Sizing</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conductor Material</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={material}
              onValueChange={(v) => { setMaterial(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {MATERIALS.map((m) => (
                <Picker.Item key={m.value} label={m.label} value={m.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wire Gauge (AWG/kcmil)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gauge}
              onValueChange={(v) => { setGauge(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {WIRE_GAUGES.map((g) => (
                <Picker.Item key={g} label={`AWG ${g}`} value={g} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insulation Temperature Rating</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={insulation}
              onValueChange={(v) => { setInsulation(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {INSULATION_TYPES.map((t) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambient Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            value={ambientTemp}
            onChangeText={setAmbientTemp}
            keyboardType="numeric"
            placeholder="e.g., 30"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.buttonRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <TouchableOpacity style={styles.primaryButton} onPress={calculateAmpacity} activeOpacity={0.7}>
              <Text style={styles.buttonText}>Get Ampacity</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <TouchableOpacity style={styles.secondaryButton} onPress={findMinWireSize} activeOpacity={0.7}>
              <Text style={[styles.buttonText, { color: '#007AFF' }]}>Find Min Size</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Find Min Size Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Current (A)</Text>
          <TextInput
            style={styles.input}
            value={loadCurrent}
            onChangeText={setLoadCurrent}
            keyboardType="decimal-pad"
            placeholder="Required for min size"
            placeholderTextColor="#666"
          />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {loadCurrent ? 'Minimum Wire Size' : `AWG ${result.gauge} Ampacity`}
            </Text>
            <Text style={styles.resultValue}>{result.ok ? `${result.amps} A` : 'Not found'}</Text>
            {!result.ok && <Text style={{ color: '#FF3B30', fontSize: 13 }}>Consider parallel conductors</Text>}
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📌 NEC Table 310.16 • Temp correction applied ({parseFloat(ambientTemp) || 30}°C)
                {material === 'al' ? ' • Aluminum × 0.84' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Reference */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Quick Reference — Common Sizes</Text>
          {[['14 AWG', '15 A'], ['12 AWG', '20 A'], ['10 AWG', '30 A'], ['8 AWG', '55 A'], ['6 AWG', '65 A']].map(([size, amp]) => (
            <View key={size} style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>{size}</Text>
              <Text style={styles.referenceValue}>{amp} (Cu, 75°C)</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';
