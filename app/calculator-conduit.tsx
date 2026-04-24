// Conduit Fill Calculator - NEC Chapter 9
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/styles';

const CONDUIT_TYPES = [
  { label: 'EMT (Electrical Metallic Tubing)', value: 'emt' },
  { label: 'RMC (Rigid Metal Conduit)', value: 'rmc' },
  { label: 'PVC Schedule 40', value: 'pvc40' },
  { label: 'PVC Schedule 80', value: 'pvc80' },
  { label: 'FMC (Flexible Metal Conduit)', value: 'fmc' },
];

// Trade sizes and their internal areas (mm²) — NEC Chapter 9 Table 4
const CONDUIT_DATA: Record<string, Record<string, number>> = {
  emt:   { '1/2': 81, '3/4': 141, '1': 236, '1-1/4': 380, '1-1/2': 492, '2': 734, '2-1/2': 1028, '3': 1475, '3-1/2': 1879, '4': 2443, '5': 3690, '6': 5523 },
  rmc:   { '1/2': 76, '3/4': 126, '1': 212, '1-1/4': 350, '1-1/2': 459, '2': 687, '2-1/2': 973, '3': 1394, '3-1/2': 1790, '4': 2330, '5': 3523, '6': 5280 },
  pvc40: { '1/2': 81, '3/4': 141, '1': 236, '1-1/4': 380, '1-1/2': 492, '2': 734, '2-1/2': 1028, '3': 1475, '3-1/2': 1879, '4': 2443, '5': 3690, '6': 5523 },
  pvc80: { '1/2': 65, '3/4': 114, '1': 191, '1-1/4': 310, '1-1/2': 403, '2': 600, '2-1/2': 841, '3': 1208, '3-1/2': 1546, '4': 2015, '5': 3051, '6': 4562 },
  fmc:   { '1/2': 79, '3/4': 137, '1': 229, '1-1/4': 371, '1-1/2': 481, '2': 718, '2-1/2': 1007, '3': 1445, '3-1/2': 1848, '4': 2403, '5': 3635, '6': 5441 },
};

// Wire cross-sectional area (mm²) — NEC Chapter 9 Table 5
const WIRE_AREA: Record<string, Record<string, number>> = {
  thhn: {
    '14': 11.7, '12': 16.6, '10': 26.8, '8': 44.5, '6': 68.4,
    '4': 107, '3': 126, '2': 144, '1': 164, '1/0': 189,
    '2/0': 218, '3/0': 252, '4/0': 286, '250': 333, '300': 382,
    '350': 430, '500': 526,
  },
  tw: {
    '14': 15.2, '12': 21.5, '10': 35.0, '8': 56.8, '6': 84.4,
    '4': 128, '3': 150, '2': 173, '1': 198, '1/0': 228,
    '2/0': 264, '3/0': 303, '4/0': 343, '250': 398, '300': 457,
    '350': 515, '500': 630,
  }
};

const WIRE_SIZES = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '500'];
const TRADE_SIZES = ['1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '3-1/2', '4', '5', '6'];

interface ConductorEntry {
  size: string;
  count: number;
}

export default function ConduitFillCalculator() {
  const [conduitType, setConduitType] = useState('emt');
  const [tradeSize, setTradeSize] = useState('3/4');
  const [wireType, setWireType] = useState('thhn');
  const [conductors, setConductors] = useState<ConductorEntry[]>([
    { size: '12', count: 9 }
  ]);
  const [newSize, setNewSize] = useState('12');
  const [newCount, setNewCount] = useState('3');
  const [result, setResult] = useState<{
    totalArea: number;
    conduitArea: number;
    fillPercent: number;
    status: 'ok' | 'warning' | 'overfill';
    maxWires: number;
  } | null>(null);

  const addConductor = () => {
    if (!newSize || !parseInt(newCount)) return;
    setConductors([...conductors, { size: newSize, count: parseInt(newCount) }]);
    setNewSize('12');
    setNewCount('3');
    setResult(null);
  };

  const removeConductor = (index: number) => {
    setConductors(conductors.filter((_, i) => i !== index));
    setResult(null);
  };

  const calculateFill = () => {
    const cArea = CONDUIT_DATA[conduitType]?.[tradeSize];
    if (!cArea) return;

    let totalWireArea = 0;
    conductors.forEach(c => {
      const area = WIRE_AREA[wireType]?.[c.size];
      if (area) totalWireArea += area * c.count;
    });

    const fillPercent = (totalWireArea / cArea) * 100;
    
    // NEC max fill: 40% (3+ wires), 31% (2 wires), 53% (1 wire)
    const wireCount = conductors.reduce((sum, c) => sum + c.count, 0);
    const maxFill = wireCount >= 3 ? 40 : wireCount === 2 ? 31 : 53;

    // Max same-size wires that fit
    if (conductors.length === 1 && wireType === 'thhn') {
      const singleArea = WIRE_AREA.thhn[conductors[0].size] || 0;
      const maxWires = Math.floor((cArea * 0.4) / singleArea);

      setResult({
        totalArea: Math.round(totalWireArea),
        conduitArea: cArea,
        fillPercent: Math.round(fillPercent * 10) / 10,
        status: fillPercent <= maxFill ? 'ok' : fillPercent > 100 ? 'overfill' : 'warning',
        maxWires,
      });
    } else {
      setResult({
        totalArea: Math.round(totalWireArea),
        conduitArea: cArea,
        fillPercent: Math.round(fillPercent * 10) / 10,
        status: fillPercent <= maxFill ? 'ok' : fillPercent > 100 ? 'overfill' : 'warning',
        maxWires: 0,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>📡 Conduit Fill Calculator</Text>
        <Text style={styles.screenSubtitle}>NEC Chapter 9 — Maximum Fill 40%</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conduit Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conduitType}
              onValueChange={(v) => { setConduitType(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {CONDUIT_TYPES.map((ct) => (
                <Picker.Item key={ct.value} label={ct.label} value={ct.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trade Size</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tradeSize}
              onValueChange={(v) => { setTradeSize(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {TRADE_SIZES.map((ts) => (
                <Picker.Item key={ts} label={`${ts}"`} value={ts} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wire Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={wireType}
              onValueChange={(v) => { setWireType(v); setResult(null); }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="THHN / THWN" value="thhn" />
              <Picker.Item label="TW / UF" value="tw" />
            </Picker>
          </View>
        </View>

        {/* Conductors List */}
        <View style={[styles.section, { paddingBottom: 12 }]}>
          <Text style={styles.sectionTitle}>Conductors ({conductors.reduce((s, c) => s + c.count, 0)} total)</Text>
          
          {conductors.map((entry, idx) => (
            <View key={idx} style={styles.conductorRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>AWG {entry.size}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>×{entry.count} wires</Text>
              </View>
              <TouchableOpacity onPress={() => removeConductor(idx)}>
                <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add conductor */}
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
            <View style={{ flex: 1 }}>
              <View style={[styles.pickerContainer, { height: 40 }]}>
                <Picker
                  selectedValue={newSize}
                  onValueChange={setNewSize}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {WIRE_SIZES.map((ws) => (
                    <Picker.Item key={ws} label={`AWG ${ws}`} value={ws} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={{ width: 70 }}>
              <TextInput
                style={[styles.input, { height: 40 }]}
                value={newCount}
                onChangeText={setNewCount}
                keyboardType="number-pad"
                placeholder="Qty"
              />
            </View>
            <TouchableOpacity style={[styles.smallButton, { height: 40, justifyContent: 'center', paddingHorizontal: 12 }]} onPress={addConductor}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={calculateFill} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Calculate Fill %</Text>
        </TouchableOpacity>

        {result && (
          <View style={[styles.resultCard, result.status === 'overfill' ? { borderColor: '#FF3B30' } : result.status === 'warning' ? { borderColor: '#FF9500' } : {}]}>
            <Text style={styles.resultLabel}>Conduit Fill Result</Text>
            
            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(result.fillPercent, 100)}%`,
                    backgroundColor: result.fillPercent > 100 ? '#FF3B30' : result.fillPercent > 80 ? '#FF9500' : '#34C759'
                  }
                ]}
              />
            </View>
            <Text style={[styles.resultValue, { fontSize: 32 }]}>{result.fillPercent}%</Text>

            <View style={styles.resultGrid}>
              <View><Text style={styles.resultSubLabel}>Total Wire Area</Text><Text style={styles.resultSubValue}>{result.totalArea} mm²</Text></View>
              <View><Text style={styles.resultSubLabel}>Conduit Area</Text><Text style={styles.resultSubValue}>{result.conduitArea} mm²</Text></View>
            </View>

            {result.maxWires > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  🔢 Max AWG {conductors[0]?.size} THHN in {tradeSize}": <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>{result.maxWires} wires</Text> (at 40%)
                </Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={[
                styles.infoText,
                result.status === 'overfill' ? { color: '#FF3B30' } :
                result.status === 'warning' ? { color: '#FF9500' } : { color: '#34C759' }
              ]}>
                {result.status === 'ok' ? '✅ Within NEC limit (≤40%)' :
                 result.status === 'warning' ? '⚠️ Approaching limit — consider larger conduit' :
                 ❌ Overfilled! Select a larger trade size or reduce conductors'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';
