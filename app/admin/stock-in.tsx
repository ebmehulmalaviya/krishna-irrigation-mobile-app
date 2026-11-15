import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';

export default function StockInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { products, recordStockIn, role } = useApp();

  // Protect route: Only admin has permission for Stock In (ખરીદી)
  if (role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed" size={56} color="#dc2626" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 16, textAlign: 'center' }}>
          એક્સેસ મર્યાદિત છે (Access Denied)
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          સ્ટોક ઇન (ખરીદી) ની એન્ટ્રી કરવાની મંજૂરી માત્ર એડમિન માટે છે. સામાન્ય ગ્રાહકને આ પરવાનગી નથી.
        </Text>
        <Pressable
          style={{ marginTop: 24, backgroundColor: '#166534', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700' }}>પાછા જાઓ</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedVariantId, setSelectedVariantId] = useState(selectedProduct?.variants[0]?.id || '');
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId) || selectedProduct?.variants[0];

  const [quantityStr, setQuantityStr] = useState('10');
  const [purchaseRateStr, setPurchaseRateStr] = useState(String(selectedVariant?.purchase_rate || 250));
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  // Handle product selection change
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
      setPurchaseRateStr(String(prod.variants[0].purchase_rate));
    }
  };

  // Handle variant selection change
  const handleSelectVariant = (varId: string) => {
    setSelectedVariantId(varId);
    const v = selectedProduct?.variants.find((item) => item.id === varId);
    if (v) {
      setPurchaseRateStr(String(v.purchase_rate));
    }
  };

  const handleSavePurchase = async () => {
    const qty = parseInt(quantityStr, 10) || 0;
    const rate = parseFloat(purchaseRateStr) || 0;

    if (qty <= 0) {
      Alert.alert('ભૂલ', 'કૃપા કરીને માન્ય ખરીદ જથ્થો દાખલ કરો.');
      return;
    }

    if (!selectedVariant) {
      Alert.alert('ભૂલ', 'પ્રોડક્ટ સાઇઝ પસંદ કરો.');
      return;
    }

    const res = await recordStockIn(selectedVariant.id, qty, rate, supplierName, notes);
    if (res.success) {
      Alert.alert('ખરીદી સફળ!', res.message, [
        { text: 'ઠીક છે', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('ભૂલ', res.message);
    }
  };

  const totalAmount = (parseInt(quantityStr, 10) || 0) * (parseFloat(purchaseRateStr) || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            સ્ટોક ઇન / માલ આવક એન્ટ્રી
          </Text>

          {/* 1. Select Product */}
          <Text style={[styles.label, { color: theme.text }]}>પ્રોડક્ટ પસંદ કરો*</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {products.map((p) => {
              const active = p.id === selectedProductId;
              return (
                <Pressable
                  key={p.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceMuted,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectProduct(p.id)}
                >
                  <Text style={[styles.chipText, { color: active ? '#ffffff' : theme.text }]}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 2. Select Size / Variant */}
          <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>
            સાઇઝ (વરિઅન્ટ) પસંદ કરો*
          </Text>
          <View style={styles.variantsRow}>
            {selectedProduct?.variants.map((v) => {
              const active = v.id === selectedVariantId;
              return (
                <Pressable
                  key={v.id}
                  style={[
                    styles.variantPill,
                    {
                      backgroundColor: active ? '#15803d' : theme.surfaceMuted,
                      borderColor: active ? '#15803d' : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectVariant(v.id)}
                >
                  <Text style={[styles.variantPillSize, { color: active ? '#ffffff' : theme.text }]}>
                    {v.size}
                  </Text>
                  <Text style={[styles.variantPillStock, { color: active ? '#86efac' : theme.textSecondary }]}>
                    હાલનો સ્ટોક: {v.current_stock}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 3. Quantity & Purchase Rate */}
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.label, { color: theme.text }]}>ખરીદ જથ્થો (નંગ)*</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                keyboardType="numeric"
                value={quantityStr}
                onChangeText={setQuantityStr}
                placeholder="10"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.label, { color: theme.text }]}>ખરીદ ભાવ પ્રતિ નંગ (₹)*</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                keyboardType="numeric"
                value={purchaseRateStr}
                onChangeText={setPurchaseRateStr}
                placeholder="250"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          {/* 4. Supplier and Notes */}
          <Text style={[styles.label, { color: theme.text }]}>સપ્લાયર / કંપનીનું નામ (વૈકલ્પિક)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="દા.ત. સુપ્રીમ પાઇપ્સ, જૈન ઇરિગેશન..."
            placeholderTextColor={theme.textSecondary}
            value={supplierName}
            onChangeText={setSupplierName}
          />

          <Text style={[styles.label, { color: theme.text }]}>નોંધ / બિલ નંબર (વૈકલ્પિક)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="ઇનવોઇસ નંબર #, ગાડી નંબર..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Summary Box */}
          <View style={[styles.summaryBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Text style={styles.summaryLabel}>કુલ ખરીદ રકમ:</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action Button */}
        <Pressable style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSavePurchase}>
          <Ionicons name="arrow-down-circle" size={20} color="#ffffff" />
          <Text style={styles.saveBtnText}>ખરીદી સેવ કરો અને સ્ટોક વધારો</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 14,
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  chipScroll: {
    marginVertical: 4,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  variantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  variantPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  variantPillSize: {
    fontSize: 14,
    fontWeight: '800',
  },
  variantPillStock: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  inputCol: {
    flex: 1,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#15803d',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});

