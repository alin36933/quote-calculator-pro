// Plumbing / Pipe Flow & Sizing Calculator — Based on IPC & ASHRAE standards
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/styles';

const PIPE_TYPES = [
  { label: 'Copper Type M', value: 'copper_m' },
  { label: 'Copper Type L', value: 'copper_l' },
  { label: 'PVC Schedule 40', value: 'pvc40' },
  { label: 'CPVC', value: 'cpvc' },
  { label: 'Galvanized Steel', value: 'galv' },
  { label: 'PEX (Cross-linked Polyethylene)', value: 'pex' },
];

const FLUID_TYPES = [
  { label: 'Cold Water (50°F/10°C)', value: 'cold', viscosity: 1.307, density: 62.4 },
  { label: 'Hot Water (140°F/60°C)', value: 'hot', viscosity: 0.474, density: 61.0 },
  { label: 'Natural Gas', value: 'gas', viscosity: 0.011, density: 0.048 },
];

// Pipe internal diameter (inches) and area (in²)
const PIPE_DATA: Record<string, Record<string, { id: number; area: number }>> = {
  copper_m: {
    '1/2': { id: 0.528, area: 0.219 },
    '3/4': { id: 0.745, area: 0.436 },
    '1': { id: 0.995, area: 0.778 },
    '1-1/4': { id: 1.245, area: 1.218 },
    '1-1/2': { id: 1.481, area: 1.723 },
    '2': { id: 1.959, area: 3.015 },
  },
  copper_l: {
    '1/2': { id: 0.492, area: 0.190 },
    '3/4': { id: 0.694, area: 0.378 },
    '1': { id: 0.925, area: 0.672 },
    '1-1/4': { id: 1.163, area: 1.062 },
    '1-1/2': { id: 1.385, area: 1.507 },
    '2': { id: 1.835, area: 2.646 },
  },
  pvc40: {
    '1/2': { id: 0.622, area: 0.304 },
    '3/4': { id: 0.824, area: 0.533 },
    '1': { id: 1.049, area: 0.864 },
    '1-1/4': { id: 1.380, area: 1.496 },
    '1-1/2': { id: 1.610, area: 2.036 },
    '2': { id: 2.047, area: 3.290 },
    '3': { id: 3.068, area: 7.393 },
    '4': { id: 4.026, area: 12.73 },
  },
  cpvc: {
    '1/2': { id: 0.555, area: 0.242 },
    '3/4': { id: 0.759, area: 0.453 },
    '1': { id: 1.005, area: 0.793 },
  },
  galv: {
    '1/2': { id: 0.622, area: 0.304 },
    '3/4': { id: 0.824, area: 0.533 },
    '1': { id: 1.049, area: 0.864 },
    '1-1/4': { id: 1.380, area: 1.496 },
    '1-1/2': { id: 1.610, area: 2.036 },
    '2': { id: 2.067, area: 3.356 },
  },
  pex: {
    '1/2': { id: 0.474, area: 0.176 },
    '3/4': { id: 0.674, area: 0.357 },
    '1': { id: 0.861, area: 0.582 },
  },
};

const PIPE_SIZES = ['1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '3', '4'];

export default function PlumbingCalculator() {
  const [mode, setMode] = useState<'flow' | 'size' | 'velocity'>('flow');
  const [pipeType, setPipeType] = useState('pvc40');
  const [pipeSize, setPipeSize] = useState('3/4');
  const [fluidType, setFluidType] = useState('cold');
  const [flowRate, setFlowRate] = useState('10'); // GPM for water, CFH for gas
  const [pipeLength, setPipeLength] = useState('100'); // feet
  const [desiredVelocity, setDesiredVelocity] = useState('5'); // ft/s

  const fluidInfo = FLUID_TYPES.find(f => f.value === fluidType)!;
  
  const [result, setResult] = useState<{
    velocity: number;
    reynolds: number;
    pressureDrop: number;
    flowRate?: number;
    recommendedSize?: string;
    frictionFactor?: number;
  } | null>(null);

  const calculateFlow = () => {
    const pipeInfo = PIPE_DATA[pipeType]?.[pipeSize];
    if (!pipeInfo) return;

    const Q_gpm = parseFloat(flowRate) || 0;
    
    // Convert GPM to cubic feet per second (CFS)
    const Q_cfs = Q_gpm / 448.831; // 1 CFS = 448.831 GPM
    
    // Velocity v = Q / A (ft/s)
    const A_sqft = pipeInfo.area / 144; // in² to ft²
    const velocity = Q_cfs / A_sqft;

    // Reynolds number Re = (ρ × v × D) / μ
    // For water at ~60°F: ρ ≈ 62.4 lb/ft³, μ ≈ 2.34 × 10⁻⁵ lb·s/ft²
    const rho = fluidInfo.density; // lb/ft³
    const mu = fluidInfo.viscosity * 6.72e-4; // convert cP to lb·s/ft²
    const D_ft = pipeInfo.id / 12;
    const reynolds = (rho * velocity * D_ft) / mu;

    // Pressure drop using Hazen-Williams equation (for water)
    // or simplified Darcy-Weisbach
    let pressureDrop = 0;
    if (fluidType !== 'gas') {
      // Hazen-Williams: ΔP = 4.52 × Q^1.85 × L / (C^1.85 × d^4.87)
      // C = roughness coefficient (PVC=150, Copper=150, Galvanized=120)
      const C = pipeType.includes('pvc') || pipeType.includes('copper') ? 150 : pipeType === 'galv' ? 120 : 140;
      const d_inches = pipeInfo.id;
      const L = parseFloat(pipeLength) || 100;
      pressureDrop = (4.52 * Math.pow(Q_gpm, 1.85) * L) / (Math.pow(C, 1.85) * Math.pow(d_inches, 4.87));
    }

    setResult({
      velocity: Math.round(velocity * 100) / 100,
      reynolds: Math.round(reynolds),
      pressureDrop: Math.round(pressureDrop * 1000) / 1000,
      frictionFactor: 0.02, // simplified turbulent flow approximation
    });
  };

  const findMinSize = () => {
    const targetVel = parseFloat(desiredVelocity) || 5;
    const Q_gpm = parseFloat(flowRate) || 0;

    for (const size of PIPE_SIZES) {
      const pipeInfo = PIPE_DATA[pipeType]?.[size];
      if (!pipeInfo) continue;
      
      const Q_cfs = Q_gpm / 448.831;
      const A_sqft = pipeInfo.area / 144;
      const vel = Q_cfs / A_sqft;
      
      if (vel <= targetVel) {
        setPipeSize(size);
        setResult({
          velocity: Math.round(vel * 100) / 100,
          reynolds: 0,
          pressureDrop: 0,
          recommendedSize: size,
        });
        return;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🚿 Plumbing Calculator</Text>
        <Text style={styles.screenSubtitle}>Pipe Flow, Sizing & Pressure Drop</Text>

        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {[{ key: 'flow', label: 'Flow Rate' }, { key: 'size', label: 'Size Finder' }, { key: 'velocity', label: 'Velocity' }].map(m => (
            <TouchableOpacity
              key={m.key}
              style={{
                flex: 1, paddingVertical: 10, alignItems: 'center',
                backgroundColor: mode === m.key ? '#007AFF' : '#1C1C27',
                borderTopLeftRadius: m.key === 'flow' ? 8 : 0,
                borderBottomLeftRadius: m.key === 'flow' ? 8 : 0,
                borderTopRightRadius: m.key === 'velocity' ? 8 : 0,
                borderBottomRightRadius: m.key === 'velocity' ? 8 : 0,
              }}
              onPress={() => { setMode(m.key as any); setResult(null); }}
            >
              <Text style={{ color: mode === m.key ? '#fff' : '#888', fontSize: 13, fontWeight: '600' }}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipe Material</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={pipeType} onValueChange={(v) => { setPipeType(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
              {PIPE_TYPES.map(pt => (
                <Picker.Item key={pt.value} label={pt.label} value={pt.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={[styles.row, styles.section]}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.sectionTitle}>Pipe Size</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={pipeSize} onValueChange={(v) => { setPipeSize(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
                {PIPE_SIZES.filter(s => PIPE_DATA[pipeType]?.[s]).map(ps => (
                  <Picker.Item key={ps} label={`"${ps}`} value={ps} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.sectionTitle}>Fluid</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={fluidType} onValueChange={(v) => { setFluidType(v); setResult(null); }} style={styles.picker} itemStyle={styles.pickerItem}>
                {FLUID_TYPES.map(ft => (
                  <Picker.Item key={ft.value} label={ft.label.split('(')[0].trim()} value={ft.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={[styles.row, styles.section]}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.sectionTitle}>Flow Rate ({fluidType === 'gas' ? 'CFH' : 'GPM'})</Text>
            <TextInput style={styles.input} value={flowRate} onChangeText={setFlowRate} keyboardType="decimal-pad" placeholder="e.g., 10" placeholderTextColor="#666" />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.sectionTitle}>Pipe Length (ft)</Text>
            <TextInput style={styles.input} value={pipeLength} onChangeText={setPipeLength} keyboardType="decimal-pad" placeholder="e.g., 100" placeholderTextColor="#666" />
          </View>
        </View>

        {(mode === 'size') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Desired Velocity (ft/s)</Text>
            <TextInput style={styles.input} value={desiredVelocity} onChangeText={setDesiredVelocity} keyboardType="decimal-pad" placeholder="Recommended: 5-8 ft/s" placeholderTextColor="#666" />
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={mode === 'size' ? findMinSize : calculateFlow} activeOpacity={0.7}>
          <Text style={styles.buttonText}>{mode === 'size' ? 'Find Minimum Size' : 'Calculate Flow'}</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {mode === 'size' ? `Recommended Size: ${result.recommendedSize}` : `Results for ${pipeSize}" ${pipeType}`}
            </Text>

            {/* Big velocity display */}
            <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: '#111', borderRadius: 10, marginVertical: 8 }}>
              <Text style={{ color: '#888', fontSize: 11 }}>Fluid Velocity</Text>
              <Text style={{ fontSize: 44, fontWeight: 'bold', color: result.velocity > 10 ? '#FF3B30' : result.velocity > 7 ? '#FF9500' : '#34C759' }}>
                {result.velocity} <Text style={{ fontSize: 18 }}>ft/s</Text>
              </Text>
              <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                {result.velocity < 4 ? '⚠️ Below min 4 ft/s — risk of sediment buildup' :
                 result.velocity > 10 ? '🔴 Excessive velocity — noise & erosion!' :
                 result.velocity > 7 ? '🟡 High — acceptable but may be noisy' :
                 '✅ Ideal range'}
              </Text>
            </View>

            <View style={styles.resultGrid}>
              <View><Text style={styles.resultSubLabel}>Reynolds Number</Text><Text style={styles.resultSubValue}>{result.reynolds.toLocaleString()}</Text></View>
              <View><Text style={styles.resultSubLabel}>Flow Regime</Text><Text style={styles.resultSubValue}>{result.reynolds > 4000 ? 'Turbulent' : result.reynolds > 2300 ? 'Transitional' : 'Laminar'}</Text></View>
            </View>

            {fluidType !== 'gas' && result.pressureDrop > 0 && (
              <>
                <View style={[styles.resultGrid, { marginTop: 8 }]}>
                  <View><Text style={styles.resultSubLabel}>Pressure Drop</Text><Text style={styles.resultSubValue}>{(result.pressureDrop * 100).toFixed(1)} in/100ft</Text></View>
                  <View><Text style={styles.resultSubLabel}>Head Loss</Text><Text style={styles.resultSubValue}>{result.pressureDrop.toFixed(2)} psi</Text></View>
                </View>
              </>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📐 Pipe ID: {PIPE_DATA[pipeType]?.[pipeSize]?.id}" • Area: {PIPE_DATA[pipeType]?.[pipeSize]?.area} in²
                {'\n'}Fluid: {FLUID_TYPES.find(f => f.value === fluidType)?.label}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Reference */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Velocity Guidelines</Text>
          {[
            ['Water supply lines', '4–8 ft/s', '✅'],
            ['Fire protection systems', '10–15 ft/s', '⚡'],
            ['Suction piping', '3–5 ft/s', '🔽'],
            ['Gas lines', '20–40 ft/s', '💨'],
            ['Drainage (gravity)', '> 2 ft/s', '🌊'],
          ].map(([use, range, icon]) => (
            <View key={use} style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>{icon} {use}</Text>
              <Text style={styles.referenceValue}>{range}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';
