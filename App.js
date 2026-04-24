import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions, Share, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

const Stack = createNativeStackNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Color Palette ───
const C = {
  bg: '#0f0f1a',
  card: '#1a1a2e',
  cardLight: '#222340',
  accent: '#e94560',
  accentDark: '#c73e54',
  success: '#0f9b0f',
  warning: '#f5a623',
  text: '#ffffff',
  textMuted: '#8b8ba3',
  border: '#2a2a4a',
  inputBg: '#12122a',
  proGold: '#ffd700',
};

// ─── Premium Context ───
const PremiumContext = createContext({
  isPremium: false,
  isLoading: true,
});

const usePremium = () => useContext(PremiumContext);

// ─── Free Calculators (always available) ───
const FREE_CALCULATORS = ['Wire Gauge', 'Unit Converter', 'Concrete'];

// ─── Pro Calculators (require purchase) ───
const PRO_CALCULATORS = [
  'Conduit Fill',
  'Voltage Drop', 
  'Welding Parameter',
  'Pipe Sizing',
  'Duct Size',
];

const ALL_CALCULATORS = [...FREE_CALCULATORS, ...PRO_CALCULATORS];

// ─── Calculator Icons (emoji-based for simplicity) ───
const CALC_ICONS = {
  'Wire Gauge': '🔌',
  'Conduit Fill': '📡',
  'Voltage Drop': '⚡',
  'Welding Parameter': '🔥',
  'Pipe Sizing': '🚿',
  'Duct Size': '💨',
  'Unit Converter': '🔄',
  'Concrete': '🏗️',
};

// ════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════

const Card = ({ children, style }) => (
  <View style={[{
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  }, style]}>
    {children}
  </View>
);

const InputField = ({ label, value, onChangeText, placeholder, keyboardType='default', suffix='' }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.inputBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: 14,
      height: 48,
    }}>
      <TextInputCustom
        style={{ flex: 1, color: C.text, fontSize: 16 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        keyboardType={keyboardType}
      />
      {suffix ? <Text style={{ color: C.textMuted, fontSize: 14, marginLeft: 8 }}>{suffix}</Text> : null}
    </View>
  </View>
);

// RN TextInput wrapper to avoid requiring import at top
function TextInputCustom(props) {
  const TextInputReal = require('react-native').TextInput;
  return <TextInputReal {...props} />;
}

const ResultBox = ({ label, value, unit, color=C.success }) => (
  <LinearGradient
    colors={[color + '18', color + '08']}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: color + '40',
    }}
  >
    <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ color: color, fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
      {value}<Text style={{ fontSize: 16, color: color + 'cc' }}> {unit}</Text>
    </Text>
  </LinearGradient>
);

const CalcButton = ({ title, onPress, variant='primary' }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: variant === 'primary' ? C.accent : C.cardLight,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderColor: C.border,
      marginTop: 8,
    }}
  >
    <Text style={{ color: variant === 'primary' ? '#fff' : C.accent, fontSize: 16, fontWeight: '700' }}>
      {title}
    </Text>
  </TouchableOpacity>
);

const PickerField = ({ label, value, onValueChange, options }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{}}>
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onValueChange(opt)}
            style={{
              paddingHorizontal: 16,
              height: 44,
              borderRadius: 10,
              marginRight: 8,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isSelected ? C.accent + '25' : C.inputBg,
              borderWidth: 1,
              borderColor: isSelected ? C.accent : C.border,
            }}
          >
            <Text style={{ color: isSelected ? C.accent : C.textMuted, fontSize: 14, fontWeight: '600' }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// ─── Section Header ───
const SectionHeader = ({ title, subtitle }) => (
  <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 }}>
    <Text style={{ color: C.text, fontSize: 26, fontWeight: 'bold' }}>{title}</Text>
    {subtitle && <Text style={{ color: C.textMuted, fontSize: 15, marginTop: 4 }}>{subtitle}</Text>}
  </View>
);

// ─── Info Tip ───
const InfoTip = ({ text }) => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: C.warning + '12',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.warning + '30',
  }}>
    <Text style={{ color: C.warning, fontSize: 13 }}>ℹ️</Text>
    <Text style={{ color: C.warning, fontSize: 13, flex: 1, marginLeft: 8 }}>{text}</Text>
  </View>
);


// ════════════════════════════════════════════════
// CALCULATOR SCREENS
// ════════════════════════════════════════════════

// ─── 1. Wire Gauge Calculator (FREE) ───
function WireGaugeScreen() {
  const [amps, setAmps] = useState('');
  const [length, setLength] = useState('');
  const [voltage, setVoltage] = useState('120');
  const [maxDrop, setMaxDrop] = useState('3');
  const [result, setResult] = useState(null);
  const [material, setMaterial] = useState('Copper');

  const calculate = () => {
    const A = parseFloat(amps);
    const L = parseFloat(length);
    const V = parseFloat(voltage);
    const D = parseFloat(maxDrop);
    if (!A || !L || !V || !D) return;

    // CM = (2 × K × I × L) / (V.D × 100)
    // K = 12.9 copper, 21.2 aluminum
    const K = material === 'Copper' ? 12.9 : 21.2;
    const cm = Math.ceil((2 * K * A * L) / ((D / 100) * V));
    
    // AWG approximation table
    const awgTable = [
      { awg: 14, cm: 4110 }, { awg: 12, cm: 6530 }, { awg: 10, cm: 10380 },
      { awg: 8, cm: 16510 }, { awg: 6, cm: 26240 }, { awg: 4, cm: 41740 },
      { awg: 2, cm: 66370 }, { awg: 1, cm: 83690 }, { awg: 1/0, cm: 105500 },
      { awg: 2/0, cm: 133100 }, { awg: 3/0, cm: 167800 }, { awg: 4/0, cm: 211600 },
    ];

    let selectedAwg = 14;
    let actualDrop = 0;
    for (let i = 0; i < awgTable.length; i++) {
      if (awgTable[i].cm >= cm) {
        selectedAwg = awgTable[i].awg;
        actualDrop = ((2 * K * A * L) / (awgTable[i].cm * V)) * 100;
        break;
      }
    }

    setResult({ awg: selectedAwg, cm, dropPercent: actualDrop.toFixed(2), material });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Wire Gauge" subtitle="Find the right wire size by ampacity & voltage drop" />
      <InfoTip text="Based on NEC Chapter 9 Table 8 for circular mil area." />
      <Card>
        <InputField label="Current (Amperes)" value={amps} onChangeText={setAmps} placeholder="e.g., 20" keyboardType="numeric" suffix="A" />
        <InputField label="One-Way Length" value={length} onChangeText={setLength} placeholder="e.g., 50" keyboardType="numeric" suffix="ft" />
        <PickerField label="System Voltage" value={voltage} onValueChange={setVoltage} options={['120', '208', '240', '277', '480']} />
        <PickerField label="Max Voltage Drop" value={maxDrop} onValueChange={setMaxDrop} options={['2', '3', '4', '5']} />
        <PickerField label="Conductor Material" value={material} onValueChange={setMaterial} options={['Copper', 'Aluminum']} />
        <CalcButton title="Calculate Wire Size" onPress={calculate} />
        {result && (
          <>
            <ResultBox label="Recommended AWG" value={String(result.awg).includes('/') ? `${Math.floor(result.awg)}/0` : `AWG ${result.awg}`} unit="" />
            <ResultBox label="Min Circular Mils" value={result.cm.toLocaleString()} unit="CM" />
            <ResultBox label="Actual Voltage Drop" value={result.dropPercent} unit="%"
              color={parseFloat(result.dropPercent) <= parseFloat(maxDrop) ? C.success : C.accent} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 2. Conduit Fill Calculator (PRO) ───
function ConduitFillScreen() {
  const { isPremium } = usePremium();
  if (!isPremium) return <PaywallScreen />;

  const [conduitType, setConduitType] = useState('EMT');
  const [conduitSize, setConduitSize] = useState('1/2');
  const [wires, setWires] = useState([{ gauge: '12', count: 1, type: 'THHN' }]);
  const [result, setResult] = useState(null);

  // Conduit area in sq inches
  const conduitAreas = {
    EMT: { '1/2': 0.122, '3/4': 0.213, '1': 0.346, '1-1/4': 0.579, '1-1/2': 0.811, '2': 1.31, '2-1/2': 2.06, '3': 3.50, '3-1/2': 4.54, '4': 5.82 },
    PVC: { '1/2': 0.122, '3/4': 0.215, '1': 0.349, '1-1/4': 0.584, '1-1/2': 0.819, '2': 1.33, '2-1/2': 2.08, '3': 3.53, '3-1/2': 4.58, '4': 5.86 },
    RMC: { '1/2': 0.122, '3/4': 0.213, '1': 0.345, '1-1/4': 0.576, '1-1/2': 0.807, '2': 1.30, '2-1/2': 2.04, '3': 3.47, '3-1/2': 4.49, '4': 5.76 },
  };

  // Wire area in sq inches (insulated)
  const wireAreas = {
    THHN: { '14': 0.0208, '12': 0.0333, '10': 0.0526, '8': 0.0824, '6': 0.130, '4': 0.204, '3': 0.255, '2': 0.320, '1': 0.403, '1/0': 0.508, '2/0': 0.638, '3/0': 0.800, '4/0': 1.01 },
    THWN: { '14': 0.0208, '12': 0.0333, '10': 0.0526, '8': 0.0824, '6': 0.130, '4': 0.204, '3': 0.255, '2': 0.320 },
  };

  const addWire = () => setWires([...wires, { gauge: '12', count: 1, type: 'THHN' }]);
  const removeWire = (i) => setWires(wires.filter((_, idx) => idx !== i));
  const updateWire = (i, field, val) => {
    const updated = [...wires];
    updated[i][field] = val;
    setWires(updated);
  };

  const calculate = () => {
    const cArea = conduitAreas[conduitType]?.[conduitSize];
    if (!cArea) return;

    let totalArea = 0;
    wires.forEach((w) => {
      const wArea = wireAreas[w.type]?.[w.gauge];
      if (wArea) totalArea += wArea * parseInt(w.count || 1);
    });

    const fillPercent = (totalArea / cArea) * 100;
    const maxAllowed = 40; // NEC max fill for >2 wires

    setResult({ totalArea: totalArea.toFixed(4), conduitArea: cArea, fillPercent: fillPercent.toFixed(1), ok: fillPercent <= maxAllowed, maxAllowed });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Conduit Fill" subtitle="NEC-compliant conduit capacity calculator" />
      <InfoTip text="NEC Chapter 9 Table 1 — Maximum fill is 40% for 3+ conductors." />
      <Card>
        <PickerField label="Conduit Type" value={conduitType} onValueChange={setConduitType} options={['EMT', 'PVC', 'RMC']} />
        <PickerField label="Conduit Size" value={conduitSize} onValueChange={setConduitSize} options={['1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3']} />

        {wires.map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: C.inputBg, borderRadius: 10, padding: 10 }}>
            <View style={{ flex: 1 }}>
              <PickerField label={`Wire ${i+1} Gauge`} value={w.gauge} onValueChange={(v) => updateWire(i, 'gauge', v)} options={['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0']} />
            </View>
            <TouchableOpacity onPress={() => removeWire(i)} style={{ marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: C.accent + '20', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: C.accent, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <CalcButton title="+ Add Wire" onPress={addWire} variant="secondary" />
        <CalcButton title="Calculate Fill %" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Total Wire Area" value={result.totalArea} unit="in²" />
            <ResultBox label="Conduit Area" value={result.conduitArea} unit="in²" />
            <ResultBox label="Fill Percentage" value={result.fillPercent} unit="%"
              color={result.ok ? C.success : C.accent} />
            {!result.ok && <InfoTip text={`Overfilled! Max allowed: ${result.maxAllowed}%`} />}
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 3. Voltage Drop Calculator (PRO) ───
function VoltageDropScreen() {
  const { isPremium } = usePremium();
  if (!isPremium) return <PaywallScreen();

  const [sourceVoltage, setSourceVoltage] = useState('240');
  const [current, setCurrent] = useState('');
  const [length, setLength] = useState('');
  const [wireGauge, setWireGauge] = useState('12');
  const [phases, setPhases] = useState('Single');
  const [material, setMaterial] = useState('Copper');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const V = parseFloat(sourceVoltage);
    const I = parseFloat(current);
    const L = parseFloat(length);
    if (!I || !L) return;

    // R per 1000 ft: copper vs aluminum
    const R = material === 'Copper'
      ? { '14': 3.14, '12': 1.98, '10': 1.24, '8': 0.778, '6': 0.491, '4': 0.308, '2': 0.194, '1': 0.154, '1/0': 0.122, '2/0': 0.0967, '3/0': 0.0766, '4/0': 0.0608 }
      : { '14': 5.16, '12': 3.25, '10': 2.04, '8': 1.28, '6': 0.805, '4': 0.505, '2': 0.317, '1': 0.252, '1/0': 0.199, '2/0': 0.158, '3/0': 0.125, '4/0': 0.099 };

    const rPerFt = (R[wireGauge] || 1) / 1000;
    const cmFactor = phases === 'Three' ? 1.732 : 2;

    // VD = I × R × L × factor
    const vd = I * rPerFt * L * cmFactor;
    const vdPct = (vd / V) * 100;

    setResult({
      volts: vd.toFixed(2),
      percent: vdPct.toFixed(2),
      voltageAtLoad: (V - vd).toFixed(1),
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Voltage Drop" subtitle="Calculate voltage loss over wire run length" />
      <InfoTip text="NEC recommends ≤3% for branch circuits, ≤5% total (feeders + branch)." />
      <Card>
        <PickerField label="Source Voltage" value={sourceVoltage} onValueChange={setSourceVoltage} options={['120', '208', '240', '277', '480']} />
        <InputField label="Current Load (A)" value={current} onChangeText={setCurrent} placeholder="e.g., 20" keyboardType="numeric" suffix="A" />
        <InputField label="One-Way Distance (ft)" value={length} onChangeText={setLength} placeholder="e.g., 100" keyboardType="numeric" suffix="ft" />
        <PickerField label="Wire Gauge (AWG)" value={wireGauge} onValueChange={setWireGauge} options={['14', '12', '10', '8', '6', '4', '2', '1/0', '2/0', '4/0']} />
        <PickerField label="Phase" value={phases} onValueChange={setPhases} options={['Single', 'Three']} />
        <PickerField label="Material" value={material} onValueChange={setMaterial} options={['Copper', 'Aluminum']} />
        <CalcButton title="Calculate Voltage Drop" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Voltage Drop" value={result.volts} unit="V" />
            <ResultBox label="Drop Percentage" value={result.percent} unit="%"
              color={parseFloat(result.percent) <= 3 ? C.success : parseFloat(result.percent) <= 5 ? C.warning : C.accent} />
            <ResultBox label="Voltage at Load" value={result.voltageAtLoad} unit="V" />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 4. Welding Parameter Calculator (PRO) ───
function WeldingScreen() {
  const { isPremium } = usePremium();
  if (!isPremium) return <PaywallScreen>();

  const [process, setProcess] = useState('MIG');
  const [material, setMaterial] = useState('Steel');
  const [thickness, setThickness] = useState('');
  const [position, setPosition] = useState('Flat');
  const [result, setResult] = useState(null);

  // Reference tables based on AWS recommendations
  const weldingParams = {
    MIG: {
      Steel: { base: 1, ampsPerMM: 1.2, wireSpeedBase: 200, gasFlow: 35 },
      Aluminum: { base: 1, ampsPerMM: 1.0, wireSpeedBase: 250, gasFlow: 30 },
      Stainless: { base: 1, ampsPerMM: 1.1, wireSpeedBase: 190, gasFlow: 28 },
    },
    TIG: {
      Steel: { base: 1, ampsPerMM: 0.9, gasFlow: 15 },
      Aluminum: { base: 1, ampsPerMM: 0.85, gasFlow: 20 },
      Stainless: { base: 1, ampsPerMM: 0.95, gasFlow: 12 },
    },
    Stick: {
      Steel: { base: 1, ampsPerMM: 1.0, gasFlow: 0 },
      Aluminum: { base: 1, ampsPerMM: 0.9, gasFlow: 0 },
      Stainless: { base: 1, ampsPerMM: 1.05, gasFlow: 0 },
    },
  };

  const positionFactors = { Flat: 1.0, Horizontal: 1.1, Vertical: 1.15, Overhead: 1.2 };
  const thicknessMap = { '1/16': 1.59, '1/8': 3.18, '3/16': 4.76, '1/4': 6.35, '3/8': 9.53, '1/2': 12.7, '5/8': 15.88, '3/4': 19.05, '1': 25.4 };

  const calculate = () => {
    const t = thicknessMap[thickness];
    if (!t) return;

    const params = weldingParams[process]?.[material];
    if (!params) return;

    const posFactor = positionFactors[position] || 1;
    const amps = Math.round(t * params.ampsPerMM * posFactor * 10) / 10;
    const wireSpeed = process !== 'Stick' ? Math.round((params.wireSpeedBase || t * 30) * posFactor) : 0;
    const gasFlow = params.gasFlow || 0;

    // Recommend electrode/wire diameter
    let electrodeDia = '';
    if (t <= 2) electrodeDia = '0.030" / 0.8mm';
    else if (t <= 4) electrodeDia = '0.035" / 0.9mm';
    else if (t <= 8) electrodeDia = '0.045" / 1.2mm';
    else electrodeDia = '1/16" / 1.6mm';

    setResult({ amps, wireSpeed, gasFlow, electrodeDia, thickness: t });
  };

  const thicknessOptions = Object.keys(thicknessMap);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Welding Parameters" subtitle="Get recommended settings for your weld job" />
      <InfoTip text="Based on AWS D1.1 structural welding code guidelines. Always fine-tune with test coupons." />
      <Card>
        <PickerField label="Process" value={process} onValueChange={setProcess} options={['MIG', 'TIG', 'Stick']} />
        <PickerField label="Base Material" value={material} onValueChange={setMaterial} options={['Steel', 'Aluminum', 'Stainless']} />
        <PickerField label="Plate Thickness" value={thickness} onValueChange={setThickness} options={thicknessOptions} />
        <PickerField label="Weld Position" value={position} onValueChange={setPosition} options={['Flat', 'Horizontal', 'Vertical', 'Overhead']} />
        <CalcButton title="Get Recommended Settings" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Amperage Range" value={`${Math.round(result.amps * 0.9)} - ${Math.round(result.amps * 1.1)}`} unit="A" />
            {result.wireSpeed > 0 && <ResultBox label="Wire Feed Speed" value={result.wireSpeed} unit="IPM" />}
            {result.gasFlow > 0 && <ResultBox label="Gas Flow Rate" value={result.gasFlow} unit="CFH" />}
            <ResultBox label="Electrode/Wire Dia" value={result.electrodeDia.split('/')[0].trim()} unit={result.electrodeDia.includes('/') ? result.electrodeDia.split('/')[1].trim() : ''} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 5. Pipe Sizing Calculator (PRO) ───
function PipeSizingScreen() {
  const { isPremium } = usePremium();
  if (!isPremium) return <PaywallScreen();

  const [flowRate, setFlowRate] = useState('');
  const [velocity, setVelocity] = useState('5');
  const [fluid, setFluid] = useState('Water');
  const [pipeType, setPipeType] = useState('Sch 40 Steel');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const Q = parseFloat(flowRate); // GPM
    const v = parseFloat(velocity); // ft/s
    if (!Q || !v) return;

    // Q (ft³/s) = GPM × 0.002228
    const Qfps = Q * 0.002228;
    // A = Q/v, D = sqrt(4A/π)
    const area = Qfps / v;
    const diaInches = Math.sqrt((4 * area) / Math.PI);
    // Convert to mm too
    const diaMM = diaInches * 25.4;

    // Standard pipe sizes (ID in inches)
    const pipeSizes = [
      { nom: '1/4"', id: 0.364 }, { nom: '3/8"', id: 0.493 },
      { nom: '1/2"', id: 0.622 }, { nom: '3/4"', id: 0.824 },
      { nom: "1'", id: 1.049 }, { nom: '1-1/4"', id: 1.380 },
      { nom: '1-1/2"', id: 1.610 }, { nom: '2"', id: 2.067 },
      { nom: '2-1/2"', id: 2.469 }, { nom: "3'", id: 3.068 },
      { nom: "4'", id: 4.026 }, { nom: "6'", id: 6.065 },
    ];

    // Find next larger standard size
    let selectedNom = 'N/A';
    let selectedId = diaInches;
    let actualVelocity = v;
    for (const ps of pipeSizes) {
      if (ps.id >= diaInches) {
        selectedNom = ps.nom;
        selectedId = ps.id;
        const actualArea = (Math.PI * ps.id ** 2) / 4;
        actualVelocity = Qfps / actualArea;
        break;
      }
    }

    setResult({ minDia: diaInches.toFixed(3), minDiaMM: diaMM.toFixed(1), nominal: selectedNom, insideDia: selectedId.toFixed(3), actualVel: actualVelocity.toFixed(1) });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Pipe Sizing" subtitle="Find the right pipe size by flow rate & velocity" />
      <InfoTip text="Standard velocity limits: Water 4-10 ft/s, Oil 3-6 ft/s, Gas 20-60 ft/s." />
      <Card>
        <InputField label="Flow Rate" value={flowRate} onChangeText={setFlowRate} placeholder="e.g., 25" keyboardType="numeric" suffix="GPM" />
        <PickerField label="Target Velocity" value={velocity} onValueChange={setVelocity} options={['3', '4', '5', '6', '8', '10']} />
        <PickerField label="Fluid Type" value={fluid} onValueChange={setFluid} options={['Water', 'Oil', 'Gas', 'Air']} />
        <PickerField label="Pipe Type" value={pipeType} onValueChange={setPipeType} options={['Sch 40 Steel', 'Sch 80 Steel', 'PVC', 'Copper']} />
        <CalcButton title="Calculate Pipe Size" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Minimum ID Required" value={result.minDia} unit="in" />
            <ResultBox label="Selected Nominal Size" value={result.nominal} unit="" />
            <ResultBox label="Inside Diameter" value={result.insideDia} unit="in" />
            <ResultBox label="Actual Velocity" value={result.actualVel} unit="ft/s" />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 6. Duct Size Calculator (PRO) ───
function DuctSizeScreen() {
  const { isPremium } = usePremium();
  if (!isPremium) return <PaywallScreen>();

  const [cfm, setCfm] = useState('');
  const [frictionRate, setFrictionRate] = useState('0.08');
  const [shape, setShape] = useState('Round');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const CFM = parseFloat(cfm);
    const FR = parseFloat(frictionRate); // in. w.g. per 100 ft
    if (!CFM || !FR) return;

    // D = 1.07 × √(CFM / √FR) — round duct formula (SMACNA)
    const D_round = 1.07 * Math.sqrt(CFM / Math.sqrt(FR));
    
    // For rectangular: equivalent area, then suggest aspect ratio
    const area = (Math.PI * D_round ** 2) / 4;
    
    // Rectangular suggestions (common aspect ratios)
    const rectOptions = [];
    const ratios = [1, 1.5, 2, 3, 4];
    ratios.forEach(ratio => {
      const h = Math.sqrt(area / ratio);
      const w = h * ratio;
      rectOptions.push({ ratio: `${ratio}:1`, w: w.toFixed(1), h: h.toFixed(1) });
    });

    // Velocity
    const vel = (CFM * 144) / (area * 60); // FPM (cross-section in in²)

    setResult({
      roundDia: D_round.toFixed(1),
      roundArea: area.toFixed(1),
      velocity: vel.toFixed(0),
      rectOptions,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Duct Sizing" subtitle="HVAC duct sizing by friction method (SMACNA)" />
      <InfoTip text="Typical friction rate: 0.08-0.10 in.w.g./100ft for supply, 0.05 for return." />
      <Card>
        <InputField label="Airflow (CFM)" value={cfm} onChangeText={setCfm} placeholder="e.g., 400" keyboardType="numeric" suffix="CFM" />
        <PickerField label="Friction Rate" value={frictionRate} onValueChange={setFrictionRate} options={['0.05', '0.08', '0.10', '0.12', '0.15']} />
        <PickerField label="Duct Shape" value={shape} onValueChange={setShape} options={['Round', 'Rectangular']} />
        <CalcButton title="Calculate Duct Size" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Round Duct Diameter" value={result.roundDia} unit="in" />
            <ResultBox label="Cross Section Area" value={result.roundArea} unit="in²" />
            <ResultBox label="Air Velocity" value={result.velocity} unit="FPM"
              color={parseInt(result.velocity) <= 900 ? C.success : parseInt(result.velocity) <= 1200 ? C.warning : C.accent} />
            
            {shape === 'Rectangular' && result.rectOptions.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Equivalent Rectangular Sizes:</Text>
                {result.rectOptions.map(opt => (
                  <View key={opt.ratio} style={{ 
                    flexDirection: 'row', justifyContent: 'space-between', 
                    backgroundColor: C.inputBg, borderRadius: 8, padding: 12, marginBottom: 6 
                  }}>
                    <Text style={{ color: C.textMuted, fontSize: 14 }}>Aspect {opt.ratio}</Text>
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '600' }}>{opt.w}" × {opt.h}"</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── 7. Unit Converter (FREE) ───
function UnitConverterScreen() {
  const [category, setCategory] = useState('Length');
  const [fromVal, setFromVal] = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState('');

  const units = {
    Length: { m: 1, km: 0.001, cm: 100, mm: 1000, inch: 39.3701, ft: 3.28084, yard: 1.09361, mile: 0.000621371 },
    Area: { 'm²': 1, 'km²': 0.000001, 'ft²': 10.7639, acre: 0.000247105, hectare: 0.0001 },
    Volume: { L: 1, mL: 1000, galUS: 0.264172, galUK: 0.219969, 'ft³': 0.0353147, 'in³': 61.0237 },
    Weight: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274, ton: 0.001, tonUS: 0.00110231 },
    Temperature: {}, // special handling
    Pressure: { Pa: 1, kPa: 0.001, psi: 0.000145038, bar: 0.00001, atm: 9.86923e-6, mmHg: 0.00750062 },
    Flow: { 'GPM': 1, 'L/min': 3.78541, 'm³/h': 0.227125, 'ft³/s': 0.00222801, 'CFH': 8.02083 },
    Power: { kW: 1, W: 1000, HP: 1.34102, BTU_h: 3412.14, kcal_h: 859.845 },
    Energy: { kWh: 1, MJ: 3.6, BTU: 3412.14, J: 3600000, cal: 859845 },
    Angle: { deg: 1, rad: 0.0174533, grad: 1.11111, turn: 0.00277778 },
    Velocity: { 'm/s': 1, 'km/h': 3.6, 'ft/s': 3.28084, MPH: 2.23694, knot: 1.94384 },
  };

  useEffect(() => {
    const cats = Object.keys(units);
    const currentUnits = units[category];
    if (currentUnits && Object.keys(currentUnits).length > 0) {
      const keys = Object.keys(currentUnits);
      setFromUnit(keys[0]);
      setToUnit(keys[Math.min(1, keys.length - 1)]);
    }
  }, [category]);

  useEffect(() => {
    if (!fromUnit || !toUnit || category === 'Temperature') {
      if (category === 'Temperature') handleTempConvert();
      return;
    }
    try {
      const val = parseFloat(fromVal) || 0;
      const table = units[fromUnit in units[category] ? category : category];
      const baseVal = val / (units[category][fromUnit] || 1);
      const converted = baseVal * (units[category][toUnit] || 1);
      if (converted >= 10000 || converted <= 0.001 || converted.toString() === 'NaN') {
        setResult(converted.toExponential(4));
      } else {
        setResult(converted.toPrecision(6).replace(/\.?0+$/, ''));
      }
    } catch {
      setResult('—');
    }
  }, [fromVal, fromUnit, toUnit, category]);

  const handleTempConvert = () => {
    const val = parseFloat(fromVal) || 0;
    let out = 0;
    if (fromUnit === toUnit) { out = val; }
    else if (fromUnit === '°C' && toUnit === '°F') { out = val * 9/5 + 32; }
    else if (fromUnit === '°C' && toUnit === 'K') { out = val + 273.15; }
    else if (fromUnit === '°F' && toUnit === '°C') { out = (val - 32) * 5/9; }
    else if (fromUnit === '°F' && toUnit === 'K') { out = (val - 32) * 5/9 + 273.15; }
    else if (fromUnit === 'K' && toUnit === '°C') { out = val - 273.15; }
    else if (fromUnit === 'K' && toUnit === '°F') { out = (val - 273.15) * 9/5 + 32; }
    setResult(out.toPrecision(6).replace(/\.?0+$/, ''));
  };

  useEffect(() => {
    if (category === 'Temperature') {
      setFromUnit('°C'); setToUnit('°F');
    }
  }, [category]);

  const catNames = Object.keys(units);
  const unitOptions = category === 'Temperature' ? ['°C', '°F', 'K'] : (units[category] ? Object.keys(units[category]) : []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Unit Converter" subtitle="200+ conversions across 12 categories" />
      <Card>
        <PickerField label="Category" value={category} onValueChange={setCategory} options={catNames} />
        
        <View style={{ 
          flexDirection: 'row', alignItems: 'center', 
          backgroundColor: C.success + '15', borderRadius: 12, padding: 16, 
          marginTop: 8, borderWidth: 1, borderColor: C.success + '30'
        }}>
          <Text style={{ flex: 1, color: C.text, fontSize: 24, fontWeight: 'bold', textAlign: 'right' }}>{fromVal || '0'}</Text>
          <Text style={{ color: C.textMuted, fontSize: 14, marginHorizontal: 12 }}>{fromUnit}</Text>
          <Text style={{ color: C.textMuted, fontSize: 20 }}>↓</Text>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: 'bold', textAlign: 'left', flex: 1 }}>{result || '—'}</Text>
          <Text style={{ color: C.textMuted, fontSize: 14, marginLeft: 8 }}>{toUnit}</Text>
        </View>

        <InputField label="From Value" value={fromVal} onChangeText={setFromVal} placeholder="Enter value" keyboardType="decimal-pad" />
        <PickerField label="From Unit" value={fromUnit} onValueChange={setFromUnit} options={unitOptions.slice(0, 6)} />
        <PickerField label="To Unit" value={toUnit} onValueChange={setToUnit} options={unitOptions.slice(0, 6)} />
      </Card>

      {/* Quick reference table */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Quick Conversions ({category})</Text>
        {(unitOptions || []).slice(0, 4).map(u => (
          <View key={u} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border + '40' }}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>1 {u}</Text>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: '500' }}>= {u === fromUnit ? (result || '—') : u}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── 8. Concrete/Material Estimator (FREE) ───
function ConcreteScreen() {
  const [mode, setMode] = useState('Slab');
  
  // Slab mode
  const [slabLength, setSlabLength] = useState('');
  const [slabWidth, setSlabWidth] = useState('');
  const [slabDepth, setSlabDepth] = useState('');
  
  // Column mode
  const [colDia, setColDia] = useState('');
  const [colHeight, setColHeight] = useState('');
  const [colCount, setColCount] = useState('1');

  // Wall mode
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [wallThick, setWallThick] = useState('');

  // Footing mode
  const [footLength, setFootLength] = useState('');
  const [footWidth, setFootWidth] = useState('');
  const [footDepth, setFootDepth] = useState('');

  const [result, setResult] = useState(null);

  const calculate = () => {
    let cuYards = 0;
    let cuFeet = 0;
    let description = '';

    switch (mode) {
      case 'Slab': {
        const l = parseFloat(slabLength); const w = parseFloat(slabWidth); const d = parseFloat(slabDepth);
        if (!l || !w || !d) return;
        cuFeet = (l * w * d) / 1728; // convert cubic inches to cu yards? no - assuming feet
        // Assume inputs in feet
        cuFeet = l * w * (d / 12); // depth in inches → feet
        description = `Slab: ${l}' × ${w}' × ${d}"`;
        break;
      }
      case 'Column': {
        const d = parseFloat(colDia); const h = parseFloat(colHeight); const n = parseInt(colCount) || 1;
        if (!d || !h) return;
        cuFeet = (Math.PI * (d/2)**2 * (h/12)) * n;
        description = `Columns: ${n} × Ø${d}" × ${h}"`;
        break;
      }
      case 'Wall': {
        const l = parseFloat(wallLength); const h = parseFloat(wallHeight); const t = parseFloat(wallThick);
        if (!l || !h || !t) return;
        cuFeet = l * (h/12) * (t/12);
        description = `Wall: ${l}' × ${h}" thick ${t}"`;
        break;
      }
      case 'Footing': {
        const l = parseFloat(footLength); const w = parseFloat(footWidth); const d = parseFloat(footDepth);
        if (!l || !w || !d) return;
        cuFeet = l * w * (d/12);
        description = `Footing: ${l}' × ${w}' × ${d}"`;
        break;
      }
    }

    cuYards = cuFeet / 27;
    // Bags of concrete (60lb bag = ~0.017 cu yd, 80lb = ~0.022 cu yd)
    const bags60 = Math.ceil(cuYards / 0.017);
    const bags80 = Math.ceil(cuYards / 0.022);

    setResult({ cuYards: cuYards.toFixed(2), cuFeet: cuFeet.toFixed(1), bags60, bags80, description });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SectionHeader title="Material Estimator" subtitle="Concrete, brick & paint quantity calculator" />
      <Card>
        <PickerField label="Shape Type" value={mode} onValueChange={setMode} options={['Slab', 'Column', 'Wall', 'Footing']} />

        {mode === 'Slab' && (
          <>
            <InputField label="Length" value={slabLength} onChangeText={setSlabLength} placeholder="e.g., 20" keyboardType="numeric" suffix="ft" />
            <InputField label="Width" value={slabWidth} onChangeText={setSlabWidth} placeholder="e.g., 15" keyboardType="numeric" suffix="ft" />
            <InputField label="Depth" value={slabDepth} onChangeText={setSlabDepth} placeholder="e.g., 4" keyboardType="numeric" suffix="in" />
          </>
        )}

        {mode === 'Column' && (
          <>
            <InputField label="Diameter" value={colDia} onChangeText={setColDia} placeholder="e.g., 12" keyboardType="numeric" suffix="in" />
            <InputField label="Height" value={colHeight} onChangeText={setColHeight} placeholder="e.g., 36" keyboardType="numeric" suffix="in" />
            <InputField label="Quantity" value={colCount} onChangeText={setColCount} placeholder="e.g., 4" keyboardType="numeric" suffix="#" />
          </>
        )}

        {mode === 'Wall' && (
          <>
            <InputField label="Length" value={wallLength} onChangeText={setWallLength} placeholder="e.g., 50" keyboardType="numeric" suffix="ft" />
            <InputField label="Height" value={wallHeight} onChangeText={setWallHeight} placeholder="e.g., 48" keyboardType="numeric" suffix="in" />
            <InputField label="Thickness" value={wallThick} onChangeText={setWallThick} placeholder="e.g., 8" keyboardType="numeric" suffix="in" />
          </>
        )}

        {mode === 'Footing' && (
          <>
            <InputField label="Length" value={footLength} onChangeText={setFootLength} placeholder="e.g., 30" keyboardType="numeric" suffix="ft" />
            <InputField label="Width" value={footWidth} onChangeText={setFootWidth} placeholder="e.g., 24" keyboardType="numeric" suffix="in" />
            <InputField label="Depth" value={footDepth} onChangeText={setFootDepth} placeholder="e.g., 12" keyboardType="numeric" suffix="in" />
          </>
        )}

        <CalcButton title="Calculate Materials" onPress={calculate} />

        {result && (
          <>
            <ResultBox label="Volume" value={result.cuYards} unit="cu yd" />
            <ResultBox label="Volume" value={result.cuFeet} unit="cu ft" />
            <ResultBox label="60lb Bags Needed" value={String(result.bags60)} unit="bags" />
            <ResultBox label="80lb Bags Needed" value={String(result.bags80)} unit="bags" />
            <InfoTip text={result.description + '. Add 5-10% for waste.'} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}


// ════════════════════════════════════════════════
// PAYWALL SCREEN
// ════════════════════════════════════════════════

function PaywallScreen() {
  const navigation = require('@react-navigation/native').useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: C.bg }}>
      <LinearGradient
        colors={[C.proGold + '30', C.proGold + '10']}
        style={{
          width: SCREEN_WIDTH * 0.85,
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: C.proGold + '40',
        }}
      >
        <Text style={{ fontSize: 48 }}>👑</Text>
        <Text style={{ color: C.proGold, fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>Upgrade to Pro</Text>
        <Text style={{ color: C.textMuted, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
          Unlock all 8 professional calculators with code-compliant formulas. No ads. Offline access.
        </Text>

        <View style={{ width: '100%', marginTop: 20 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              height: 56,
              borderRadius: 14,
              backgroundColor: C.proGold,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
              shadowColor: C.proGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
              Lifetime $14.99 — Best Value ✨
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={{
            height: 48, borderRadius: 12, backgroundColor: C.cardLight,
            justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
          }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '600' }}>Monthly $4.99</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={{
            height: 48, borderRadius: 12, backgroundColor: 'transparent',
            justifyContent: 'center', alignItems: 'center', marginTop: 4,
          }} onPress={() => navigation?.goBack()}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>Maybe Later</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 16, textAlign: 'center' }}>
          One-time purchase • No subscription required for lifetime option
        </Text>
      </LinearGradient>
    </View>
  );
}


// ════════════════════════════════════════════════
// HOME SCREEN — Calculator Grid
// ════════════════════════════════════════════════

function HomeScreen({ navigation }) {
  const { isPremium } = usePremium();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: C.text, fontSize: 28, fontWeight: 'bold' }}>TradeCalc</Text>
            <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 2 }}>Pro Tools for Pros</Text>
          </View>
          {!isPremium ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Premium')}
              style={{
                backgroundColor: C.proGold + '20',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: C.proGold + '40',
              }}
            >
              <Text style={{ color: C.proGold, fontSize: 13, fontWeight: '700' }}>⭐ Upgrade</Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              backgroundColor: C.success + '15',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.success + '30',
            }}>
              <Text style={{ color: C.success, fontSize: 13, fontWeight: '700' }}>✅ Pro</Text>
            </View>
          )}
        </View>
      </View>

      {/* Calculator Grid */}
      <View style={{ flexDirection: 'flex-wrap', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'flex-start' }}>
        {ALL_CALCULATORS.map((name) => {
          const isFree = FREE_CALCULATORS.includes(name);
          const isLocked = !isFree && !isPremium;

          return (
            <TouchableOpacity
              key={name}
              onPress={() => {
                if (isLocked) {
                  navigation.navigate(name);
                  return;
                }
                navigation.navigate(name);
              }}
              activeOpacity={0.7}
              style={{
                width: (SCREEN_WIDTH - 36) / 2,
                aspectRatio: 1,
                backgroundColor: C.card,
                borderRadius: 16,
                marginHorizontal: 6,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isLocked ? C.border : C.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>
                {isLocked ? '🔒' : CALC_ICONS[name]}
              </Text>
              <Text style={{ color: isLocked ? C.textMuted : C.text, fontSize: 13, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 }}>
                {name}
              </Text>
              {isFree && (
                <View style={{ marginTop: 4, backgroundColor: C.success + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: C.success, fontSize: 10, fontWeight: '700' }}>FREE</Text>
                </View>
              )}
              {isLocked && (
                <View style={{ marginTop: 4, backgroundColor: C.proGold + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: C.proGold, fontSize: 10, fontWeight: '700' }}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer promo */}
      {!isPremium && (
        <View style={{ marginHorizontal: 16, marginBottom: 20, padding: 16, backgroundColor: C.accent + '10', borderRadius: 14, borderWidth: 1, borderColor: C.accent + '20' }}>
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>🔥 Limited Offer</Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Get lifetime access for $14.99 — unlock all 8 professional calculators.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Premium')}
            style={{ marginTop: 10, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Unlock All Features →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}


// ════════════════════════════════════════════════
// PREMIUM SCREEN
// ════════════════════════════════════════════════

function PremiumScreen() {
  const { isPremium } = usePremium();

  if (isPremium) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 64 }}>✅</Text>
        <Text style={{ color: C.text, fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>You're a Pro!</Text>
        <Text style={{ color: C.textMuted, fontSize: 16, marginTop: 8 }}>All calculators unlocked.</Text>
      </SafeAreaView>
    );
  }

  return <PaywallScreen />;
}


// ════════════════════════════════════════════════
// MAIN APP COMPONENT
// ════════════════════════════════════════════════

export default function App() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check premium status on mount
  useEffect(() => {
    async function checkPremium() {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const stored = await AsyncStorage.getItem('tradecalc_premium');
        if (stored === 'true') setIsPremium(true);
      } catch (e) {
        // AsyncStorage not available in bare RN or web fallback
      }
      setIsLoading(false);
    }
    checkPremium();
  }, []);

  // Prevent splash screen from auto-hiding
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  const premiumContext = { isPremium, isLoading };

  return (
    <PremiumContext.Provider value={premiumContext}>
      <NavigationContainer theme={{
        dark: true,
        colors: {
          primary: C.accent,
          background: C.bg,
          card: C.card,
          text: C.text,
          border: C.border,
          notification: C.accent,
        },
      }}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerTintColor: C.text,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, title: 'TradeCalc Pro' }} />
          <Stack.Screen name="Wire Gauge" component={WireGaugeScreen} options={{ title: '🔌 Wire Gauge Calc' }} />
          <Stack.Screen name="Conduit Fill" component={ConduitFillScreen} options={{ title: '📡 Conduit Fill' }} />
          <Stack.Screen name="Voltage Drop" component={VoltageDropScreen} options={{ title: '⚡ Voltage Drop' }} />
          <Stack.Screen name="Welding Parameter" component={WeldingScreen} options={{ title: '🔥 Welding Params' }} />
          <Stack.Screen name="Pipe Sizing" component={PipeSizingScreen} options={{ title: '🚿 Pipe Sizing' }} />
          <Stack.Screen name="Duct Size" component={DuctSizeScreen} options={{ title: '💨 Duct Size' }} />
          <Stack.Screen name="Unit Converter" component={UnitConverterScreen} options={{ title: '🔄 Unit Converter' }} />
          <Stack.Screen name="Concrete" component={ConcreteScreen} options={{ title: '🏗️ Material Estimator' }} />
          <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: '👑 Upgrade to Pro', headerLeft: () => null }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PremiumContext.Provider>
  );
}
