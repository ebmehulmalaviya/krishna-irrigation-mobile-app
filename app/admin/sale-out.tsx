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

export default function SaleOutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { products, recordSale, role } = useApp();

  // Protect route: Only admin has permission for Sales Entry (વેચાણ)
  if (role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed" size={56} color="#dc2626" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 16, textAlign: 'center' }}>
          એક્સેસ મર્યાદિત છે (Access Denied)
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          વેચાણ (Sales Entry) કરવાની મંજૂરી માત્ર સ્ટોર માલિક / એડમિન માટે છે. સામાન્ય ગ્રાહકને આ પરવાનગી નથી.
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

  const [quantityStr, setQuantityStr] = useState('5');
  const [sellingRateStr, setSellingRateStr] = useState(String(selectedVariant?.selling_rate || 306));
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Handle product selection
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
      setSellingRateStr(String(prod.variants[0].selling_rate));
    }
  };

  // Handle variant selection
  const handleSelectVariant = (varId: string) => {
    setSelectedVariantId(varId);
    const v = selectedProduct?.variants.find((item) => item.id === varId);
    if (v) {
      setSellingRateStr(String(v.selling_rate));
    }
  };

  const currentAvailableStock = selectedVariant?.current_stock || 0;
  const qty = parseInt(quantityStr, 10) || 0;
  const rate = parseFloat(sellingRateStr) || 0;
  const totalAmount = qty * rate;

  const handleSaveSale = async () => {
    if (qty <= 0) {
      Alert.alert('ભૂલ', 'કૃપા કરીને માન્ય વેચાણ જથ્થો દાખલ કરો.');
      return;
    }

    if (qty > currentAvailableStock) {
      Alert.alert(
        'અપૂરતો સ્ટોક!',
        `હાલમાં માત્ર ${currentAvailableStock} નંગ ઉપલબ્ધ છે. તમે ${qty} નંગ વેચી શકતા નથી.`
      );
      return;
    }

    if (!selectedVariant) {
      Alert.alert('ભૂલ', 'પ્રોડક્ટ સાઇઝ પસંદ કરો.');
      return;
    }

    const res = await recordSale(selectedVariant.id, qty, rate, customerName, notes);
    if (res.success) {
      Alert.alert('વેચાણ સફળ!', res.message, [
        { text: 'ઠીક છે', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('ભૂલ', res.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            વેચાણ બિલ / સ્ટોક આઉટ એન્ટ્રી
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
            સાઇઝ પસંદ કરો (Size)*
          </Text>
          <View style={styles.variantsRow}>
            {selectedProduct?.variants.map((v) => {
              const active = v.id === selectedVariantId;
              const isOutOfStock = v.current_stock <= 0;
              return (
                <Pressable
                  key={v.id}
                  style={[
                    styles.variantPill,
                    {
                      backgroundColor: active ? '#0284c7' : isOutOfStock ? '#fee2e2' : theme.surfaceMuted,
                      borderColor: active ? '#0284c7' : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectVariant(v.id)}
                >
                  <Text style={[styles.variantPillSize, { color: active ? '#ffffff' : theme.text }]}>
                    {v.size}
                  </Text>
                  <Text
                    style={[
                      styles.variantPillStock,
                      { color: active ? '#e0f2fe' : isOutOfStock ? '#dc2626' : '#15803d' },
                    ]}
                  >
                    સ્ટોક: {v.current_stock}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 3. Sold Quantity and Selling Rate */}
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.label, { color: theme.text }]}>વેચાણ જથ્થો (નંગ)*</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceMuted,
                    color: theme.text,
                    borderColor: qty > currentAvailableStock ? '#dc2626' : theme.border,
                  },
                ]}
                keyboardType="numeric"
                value={quantityStr}
                onChangeText={setQuantityStr}
                placeholder="5"
                placeholderTextColor={theme.textSecondary}
              />
              {qty > currentAvailableStock && (
                <Text style={styles.errorText}>ઉપલબ્ધ કરતાં વધુ જથ્થો!</Text>
              )}
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.label, { color: theme.text }]}>વેચાણ ભાવ પ્રતિ નંગ (₹)*</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#e0f2fe', color: '#0284c7', borderColor: '#38bdf8' }]}
                keyboardType="numeric"
                value={sellingRateStr}
                onChangeText={setSellingRateStr}
                placeholder="306"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          {/* 4. Customer Name and Notes */}
          <Text style={[styles.label, { color: theme.text }]}>ગ્રાહક / ખેડૂતનું નામ (વૈકલ્પિક)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="દા.ત. રમેશભાઈ પટેલ (રાજકોટ)"
            placeholderTextColor={theme.textSecondary}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={[styles.label, { color: theme.text }]}>નોંધ (વૈકલ્પિક)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="પેમેન્ટ મોડ (રોકડ/UPI), ગામ..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Total Valuation Box */}
          <View style={[styles.summaryBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <Text style={styles.summaryLabel}>કુલ બિલ રકમ:</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: qty > currentAvailableStock ? '#94a3b8' : '#0284c7',
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          disabled={qty > currentAvailableStock}
          onPress={handleSaveSale}
        >
          <Ionicons name="arrow-up-circle" size={20} color="#ffffff" />
          <Text style={styles.saveBtnText}>વેચાણ સેવ કરો અને સ્ટોક બાદ કરો</Text>
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
    fontWeight: '700',
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
  errorText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
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
    color: '#0284c7',
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0284c7',
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

