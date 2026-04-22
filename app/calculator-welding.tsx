// Welding Parameter Calculator — SMAW, GMAW, GTAW
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/styles';

const WELDING_PROCESSES = [
  { label: 'SMAW (Stick)', value: 'smaw' },
  { label: 'GMAW (MIG)', value: 'gmaw' },
  { label: 'GTAW (TIG)', value: 'gtaw' },
];

interface WeldingParameter {
  process: string;
  material: string;
  thickness: string; // range
  electrodeSize: string;
  amperage: string;
  voltage: string;
  wireFeed?: string;
  gasType: string;
  gasFlow: string;
}

// Comprehensive welding parameter database
const WELD_DB: WeldingParameter[] = [
  // === SMAW / Stick Welding ===
  // Carbon Steel - E6011/E6013
  { process: 'smaw', material: 'Carbon Steel', thickness: '< 1/8" (3mm)', electrodeSize: '1/16"', amperage: '20-50 A', voltage: '17-21 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Carbon Steel', thickness: '1/8"-1/4"', electrodeSize: '3/32"', amperage: '40-100 A', voltage: '18-23 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Carbon Steel', thickness: '1/4"-3/8"', electrodeSize: '1/8"', amperage: '75-160 A', voltage: '20-25 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Carbon Steel', thickness: '3/8"-1/2"', electrodeSize: '5/32"', amperage: '110-220 A', voltage: '22-27 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Carbon Steel', thickness: '> 1/2"', electrodeSize: '3/16"', amperage: '180-300+ A', voltage: '24-30 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  
  // Stainless Steel - E308L-16
  { process: 'smaw', material: 'Stainless Steel', thickness: '< 1/8"', electrodeSize: '3/32"', amperage: '35-65 A', voltage: '18-22 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Stainless Steel', thickness: '1/8"-1/4"', electrodeSize: '1/8"', amperage: '70-130 A', voltage: '20-25 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Stainless Steel', thickness: '> 1/4"', electrodeSize: '5/32"', amperage: '110-200 A', voltage: '22-28 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },

  // Cast Iron - ENi-CI
  { process: 'smaw', material: 'Cast Iron', thickness: 'All common', electrodeSize: '1/8"-3/16"', amperage: '60-140 A', voltage: '18-24 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },

  // Aluminum - E4043
  { process: 'smaw', material: 'Aluminum', thickness: '1/8"-3/16"', electrodeSize: '1/8"', amperage: '60-90 A', voltage: '18-22 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },
  { process: 'smaw', material: 'Aluminum', thickness: '> 3/16"', electrodeSize: '5/32"', amperage: '80-140 A', voltage: '19-24 V', gasType: 'N/A (Flux coated)', gasFlow: '-' },

  // === GMAW / MIG Welding ===
  // Carbon Steel - ER70S-6 with C-25
  { process: 'gmaw', material: 'Carbon Steel', thickness: '22-18 ga (< 1.2mm)', electrodeSize: '.023" (0.6mm)', amperage: '40-60 A', voltage: '15-18 V', wireFeed: '150-250 ipm', gasType: 'C-25 (Ar + 25% CO₂)', gasFlow: '20-25 CFH' },
  { process: 'gmaw', material: 'Carbon Steel', thickness: '14-16 ga (1.2-2mm)', electrodeSize: '.030" (0.8mm)', amperage: '60-120 A', voltage: '17-21 V', wireFeed: '180-320 ipm', gasType: 'C-25 (Ar + 25% CO₂)', gasFlow: '20-25 CFH' },
  { process: 'gmaw', material: 'Carbon Steel', thickness: '10-12 ga (2.5-3mm)', electrodeSize: '.035" (0.9mm)', amperage: '100-170 A', voltage: '18-24 V', wireFeed: '240-400 ipm', gasType: 'C-25 (Ar + 25% CO₂)', gasFlow: '25-30 CFH' },
  { process: 'gmaw', material: 'Carbon Steel', thickness: '1/8"-1/4" (3-6mm)', electrodeSize: '.045" (1.1mm)', amperage: '150-230 A',电压: '20-26 V', wireFeed: '280-450 ipm', gasType: 'C-25 (Ar + 25% CO₂)', gasFlow: '28-35 CFH' },
  
  // Stainless Steel - ER308L with Tri-mix
  { process: 'gmaw', material: 'Stainless Steel', thickness: '18-22 ga (< 1mm)', electrodeSize: '.023" (0.6mm)', amperage: '40-70 A', voltage: '15-18 V', wireFeed: '150-260 ipm', gasType: 'Tri-Mix (He + Ar + CO₂)', gasFlow: '18-22 CFH' },
  { process: 'gmaw', material: 'Stainless Steel', thickness: '12-16 ga (1.5-2.5mm)', electrodeSize: '.030" (0.8mm)', amperage: '70-140 A', voltage: '17-22 V', wireFeed: '200-360 ipm', gasType: 'Tri-Mix (He + Ar + CO₂)', gasFlow: '20-25 CFH' },
  { process: 'gmaw', material: 'Stainless Steel', thickness: '> 10 ga (> 2.5mm)', electrodeSize: '.035"-.045"', amperage: '120-210 A', voltage: '20-26 V', wireFeed: '280-420 ipm', gasType: 'Tri-Mix (He + Ar + CO₂)', gasFlow: '25-30 CFH' },
  
  // Aluminum - ER4043 with Argon
  { process: 'gmaw', material: 'Aluminum', thickness: '14-18 ga (< 1.5mm)', electrodeSize: '.023"-.030"', amperage: '50-100 A', voltage: '16-21 V', wireFeed: '180-350 ipm', gasType: 'Pure Argon (99.99%)', gasFlow: '20-30 CFH' },
  { process: 'gmaw', material: 'Aluminum', thickness: '10-12 ga (2.5-3mm)', electrodeSize: '.035" (0.9mm)', amperage: '90-150 A', voltage: '18-24 V', wireFeed: '250-420 ipm', gasType: 'Pure Argon (99.99%)', gasFlow: '25-35 CFH' },
  { process: 'gmaw', material: 'Aluminum', thickness: '1/8"-1/4" (> 3mm)', electrodeSize: '.045" (1.1mm)', amperage: '140-220 A', voltage: '21-27 V', wireFeed: '320-500 ipm', gasType: 'Pure Argon (99.99%)', gasFlow: '30-40 CFH' },

  // === GTAW / TIG Welding ===
  // Carbon Steel
  { process: 'gtaw', material: 'Carbon Steel', thickness: '< 1/16" (< 1.5mm)', electrodeSize: '1/16" Tungsten', amperage: '20-60 A', voltage: '10-16 V', gasType: 'Argon', gasFlow: '12-15 CFH' },
  { process: 'gtaw', material: 'Carbon Steel', thickness: '1/16"-1/8" (1.5-3mm)', electrodeSize: '3/32" Tungsten', amperage: '55-120 A', voltage: '11-18 V', gasType: 'Argon', gasFlow: '12-15 CFH' },
  { process: 'gtaw', material: 'Carbon Steel', thickness: '1/8"-3/16" (3-5mm)', electrodeSize: '1/8" Tungsten', amperage: '90-180 A', voltage: '12-20 V', gasType: 'Argon', gasFlow: '15-20 CFH' },
  { process: 'gtaw', material: 'Carbon Steel',厚度: '> 3/16" (> 5mm)', electrodeSize: '1/8"-3/16" Tung.', amperage: '150-270 A', voltage: '13-22 V', gasType: 'Argon', gasFlow: '18-25 CFH' },
  
  // Stainless Steel
  { process: 'gtaw', material: 'Stainless Steel', thickness: '< 1/16" (< 1.5mm)', electrodeSize: '1/16" (Red) EWTh2', amperage: '20-55 A', voltage: '10-15 V', gasType: 'Argon (DCEN)', gasFlow: '10-15 CFH' },
  { process: 'gtaw', material: 'Stainless Steel', thickness: '1/16"-1/8"', electrodeSize: '3/32" (Red) EWTh2', amperage: '50-120 A', voltage: '11-17 V', gasType: 'Argon (DCEN)', gasFlow: '12-18 CFH' },
  { process: 'gtaw', material: 'Stainless Steel', thickness: '1/8"-1/4"', electrodeSize: '1/8" (Red) EWTh2', amperage: '90-190 A', voltage: '13-20 V', gasType: 'Argon (DCEN)', gasFlow: '15-22 CFH' },
  
  // Aluminum (AC)
  { process: 'gtaw', material: 'Aluminum', thickness: '< 1/16" (< 1.5mm)',电极Size: '1/16" (Green) EWPure', amperage: '20-50 A', voltage: '10-14 V', gasType: 'Argon (AC)', gasFlow: '10-15 CFH' },
  { process: 'gtaw', material: 'Aluminum', thickness: '1/16"-1/8"', electrodeSize: '3/32" (Green) EWPure', amperage: '45-110 A', voltage: '11-16 V', gasType: 'Argon (AC)', gasFlow: '12-18 CFH' },
  { process: 'gtaw', material: 'Aluminum', thickness: '1/8"-3/16"', electrodeSize: '1/8" (Green) EWPure', amperage: '85-170 A', voltage: '13-19 V', gasType: 'Argon (AC)', gasFlow: '15-20 CFH' },
];

const MATERIAL_OPTIONS = ['Carbon Steel', 'Stainless Steel', 'Aluminum', 'Cast Iron'];
const THICKNESS_OPTIONS = ['< 1/8" (3mm)', '1/8"-1/4"', '1/4"-3/8"', '3/8"-1/2"', '> 1/2"'];

export default function WeldingCalculator() {
  const [process, setProcess] = useState('smaw');
  const [material, setMaterial] = useState('Carbon Steel');
  const [thickness, setThickness] = useState('1/8"-1/4"');

  const results = WELD_DB.filter(w => 
    w.process === process && 
    w.material === material &&
    (w.thickness.includes(thickness.split('-')[0]?.trim()) || 
     thickness.includes('<') || thickness.includes('>'))
  );

  const primaryResult = results[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🔥 Welding Parameter Calc</Text>
        <Text style={styles.screenSubtitle}>AWS Recommended Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welding Process</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={process} onValueChange={setProcess} style={styles.picker} itemStyle={styles.pickerItem}>
              {WELDING_PROCESSES.map(p => (
                <Picker.Item key={p.value} label={`${p.label}`} value={p.value} />
              ))}
            </Picker>
          </View>
          {/* Process description */}
          <Text style={{ color: '#888', fontSize: 11, marginTop: 4 }}>
            {process === 'smaw' ? 'Shielded Metal Arc — Most versatile, works outdoors in wind'
             : process === 'gmaw' ? 'Gas Metal Arc — Fast, easy to learn, clean welds'
             : 'Gas Tungsten Arc — Highest quality, precise control'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Material</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={material} onValueChange={setMaterial} style={styles.picker} itemStyle={styles.pickerItem}>
              {MATERIAL_OPTIONS.map(m => (
                <Picker.Item key={m} label={m} value={m} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material Thickness</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={thickness} onValueChange={setThickness} style={styles.picker} itemStyle={styles.pickerItem}>
              {THICKNESS_OPTIONS.map(t => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Results */}
        {primaryResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {process.toUpperCase()} — {material}
            </Text>

            <View style={{ marginTop: 12 }}>
              {/* Amperage — big and prominent */}
              <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>Recommended Amperage Range</Text>
                <Text style={{
                  fontSize: 42,
                  fontWeight: 'bold',
                  color: '#FF6B35',
                  letterSpacing: 1,
                }}>{primaryResult.amperage}</Text>
              </View>

              {/* Parameters grid */}
              <View style={[styles.resultGrid, { marginBottom: 10 }]}>
                <View><Text style={styles.resultSubLabel}>Electrode/Wire</Text><Text style={styles.resultSubValue}>{primaryResult.electrodeSize}</Text></View>
                <View><Text style={styles.resultSubLabel}>Voltage</Text><Text style={styles.resultSubValue}>{primaryResult.voltage}</Text></View>
              </View>

              {primaryResult.wireFeed && (
                <View style={styles.resultGrid}>
                  <View><Text style={styles.resultSubLabel}>Wire Feed Speed</Text><Text style={styles.resultSubValue}>{primaryResult.wireFeed}</Text></View>
                  <View><Text style={styles.resultSubLabel}>Gas Flow</Text><Text style={styles.resultSubValue}>{primaryResult.gasFlow}</Text></View>
                </View>
              )}

              {!primaryResult.wireFeed && primaryResult.gasFlow !== '-' && (
                <View style={styles.resultGrid}>
                  <View><Text style={styles.resultSubLabel}>Gas Type</Text><Text style={styles.resultSubValue}>{primaryResult.gasType}</Text></View>
                  <View><Text style={styles.resultSubLabel}>Flow Rate</Text><Text style={styles.resultSubValue}>{primaryResult.gasFlow}</Text></View>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Always fine-tune within the recommended range based on joint configuration, position, and fit-up quality.
                {'\n'}Start at the lower end of the amperage range and adjust upward.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.infoBox, { borderColor: '#FF9500' }]}>
            <Text style={[styles.infoText, { color: '#FF9500' }]}>
              No exact match found for this combination. Try adjusting thickness or check if this material is commonly welded with the selected process.
            </Text>
          </View>
        )}

        {/* Additional matches */}
        {results.length > 1 && (
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Alternative Settings ({results.length - 1})</Text>
            {results.slice(1).map((r, i) => (
              <View key={i} style={[styles.referenceRow, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#aaa', fontSize: 12 }}>{r.electrodeSize}</Text>
                  <Text style={{ color: '#fff', fontSize: 13 }}>{r.amperage} • {r.voltage}</Text>
                </View>
                <Text style={{ color: '#666', fontSize: 11 }}>{r.thickness}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Tips */}
        <View style={[styles.section, { marginTop: 12, padding: 14 }]}>
          <Text style={{ color: '#FF9500', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>⚡ Pro Tips</Text>
          {[
            'Clean the base metal before welding — contamination causes porosity.',
            'For out-of-position work, reduce amperage by 10-15% to control puddle.',
            'Use shorter arc length on thin materials to prevent burn-through.',
            'Preheat thick sections (especially cast iron) to avoid cracking.',
          ].map((tip, i) => (
            <Text key={i} style={{ color: '#bbb', fontSize: 12, lineHeight: 18, marginBottom: 4 }}>• {tip}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
