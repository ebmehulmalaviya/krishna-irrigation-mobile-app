import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';
import { ProductVariant } from '@/types';
import { IrrigationGraphic } from '@/components/IrrigationGraphic';
import { uploadImageToSupabase } from '@/lib/storage';

export default function AddProductScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { categories, products, addProduct, updateProduct, role } = useApp();

  // Route protection: Only Admin can add or edit products
  if (role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed" size={56} color="#dc2626" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 16, textAlign: 'center' }}>
          એક્સેસ મર્યાદિત છે (Admin Only)
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          નવી પ્રોડક્ટ, સાઇઝ ઉમેરવા કે ભાવ બદલવા માટે એડમિન લૉગિન જરૂરી છે.
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

  const existingProduct = productId ? products.find((p) => p.id === productId) : undefined;

  const [name, setName] = useState(existingProduct?.name || '');
  const [nameEn, setNameEn] = useState(existingProduct?.name_en || '');
  const [sku, setSku] = useState(existingProduct?.sku || '');
  const [imageUrl, setImageUrl] = useState(existingProduct?.image_url || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.category_id || categories[0]?.id || '');

  // Dynamic Sizes / Variants
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id'>[]>(
    existingProduct?.variants.map((v) => ({
      size: v.size,
      purchase_rate: v.purchase_rate,
      selling_rate: v.selling_rate,
      opening_stock: v.opening_stock,
      current_stock: v.current_stock,
      low_stock_limit: v.low_stock_limit,
      pack_text: v.pack_text || 'જથ્થો',
      is_active: v.is_active,
    })) || [
      {
        size: '2"',
        purchase_rate: 250,
        selling_rate: 306,
        opening_stock: 50,
        current_stock: 50,
        low_stock_limit: 10,
        pack_text: 'જથ્થો',
        is_active: true,
      },
    ]
  );

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('પરવાનગી જરૂરી', 'ગેલેરીમાંથી ફોટો પસંદ કરવા માટે પરવાનગી આપો.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const cloudUrl = await uploadImageToSupabase(result.assets[0], 'products');
        setImageUrl(cloudUrl);
      }
    } catch (e) {
      Alert.alert('ભૂલ', 'ફોટો પસંદ કરવામાં ભૂલ આવી.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('પરવાનગી જરૂરી', 'ફોટો પાડવા માટે કેમેરા પરવાનગી આપો.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const cloudUrl = await uploadImageToSupabase(result.assets[0], 'products');
        setImageUrl(cloudUrl);
      }
    } catch (e) {
      Alert.alert('ભૂલ', 'કેમેરા શરૂ કરવામાં ભૂલ આવી.');
    }
  };

  const handleAddSizeRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '',
        purchase_rate: 0,
        selling_rate: 0,
        opening_stock: 0,
        current_stock: 0,
        low_stock_limit: 5,
        is_active: true,
      },
    ]);
  };

  const handleRemoveSizeRow = (index: number) => {
    if (variants.length <= 1) {
      Alert.alert('ધ્યાન આપો', 'ઓછામાં ઓછી એક સાઇઝ હોવી જરૂરી છે.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateVariantField = (
    index: number,
    field: keyof Omit<ProductVariant, 'id' | 'product_id'>,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('ભૂલ', 'કૃપા કરીને પ્રોડક્ટનું નામ (ગુજરાતીમાં) દાખલ કરો.');
      return;
    }

    if (variants.some((v) => !v.size.trim() || v.selling_rate <= 0)) {
      Alert.alert('ભૂલ', 'બધી સાઇઝ અને વેચાણ ભાવ યોગ્ય રીતે ભરો.');
      return;
    }

    if (existingProduct) {
      await updateProduct(existingProduct.id, {
        name,
        name_en: nameEn,
        sku: sku.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        description,
        category_id: categoryId,
        variants: variants.map((v, idx) => ({
          ...v,
          id: existingProduct.variants[idx]?.id || `var-${Date.now()}-${idx}`,
          product_id: existingProduct.id,
        })),
      });
      Alert.alert('સફળ', 'પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!');
    } else {
      await addProduct({
        name,
        name_en: nameEn,
        sku: sku.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        description,
        category_id: categoryId,
        is_active: true,
        variants: variants.map((v, idx) => ({
          ...v,
          id: `var-${Date.now()}-${idx}`,
          product_id: '',
        })),
      });
      Alert.alert('સફળ', 'નવી પ્રોડક્ટ સફળતાપૂર્વક સેવ થઈ ગઈ છે!');
    }

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Details */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>પ્રોડક્ટ સામાન્ય માહિતી</Text>

          <Text style={[styles.label, { color: theme.text }]}>પ્રોડક્ટનું નામ (ગુજરાતી)*</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="દા.ત. યુનિયન વાલ્વ પ્લેન"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: theme.text }]}>અંગ્રેજી નામ (વૈકલ્પિક)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Union Valve Plain"
            placeholderTextColor={theme.textSecondary}
            value={nameEn}
            onChangeText={setNameEn}
          />

          {/* SKU Code (Screenshot 2: 1 P, 1 T, 2A, 3 P) */}
          <Text style={[styles.label, { color: theme.text }]}>SKU / આઇટમ કોડ (દા.ત. 1 P, 1 T, 2A)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="દા.ત. 1 P, 1 T, 2A..."
            placeholderTextColor={theme.textSecondary}
            value={sku}
            onChangeText={setSku}
          />

          {/* Product Image Upload Section */}
          <View style={styles.imageSectionBox}>
            <Text style={[styles.label, { color: theme.text }]}>પ્રોડક્ટ ફોટો / ઇમેજ</Text>
            <View style={styles.previewContainer}>
              <View style={styles.previewBox}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.previewImg} resizeMode="contain" />
                ) : (
                  <IrrigationGraphic type="union-valve" width={60} height={60} />
                )}
              </View>

              <View style={styles.imageActionButtons}>
                <Pressable style={styles.uploadBtn} onPress={handlePickFromGallery}>
                  <Ionicons name="images-outline" size={16} color="#ffffff" />
                  <Text style={styles.uploadBtnText}>ગેલેરીમાંથી લો</Text>
                </Pressable>

                <Pressable style={styles.cameraBtn} onPress={handleTakePhoto}>
                  <Ionicons name="camera-outline" size={16} color="#ffffff" />
                  <Text style={styles.cameraBtnText}>કેમેરાથી પાડો</Text>
                </Pressable>
              </View>
            </View>

            <TextInput
              style={[styles.smallInput, { marginTop: 6, backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              placeholder="અથવા ઇમેજ લિંક / URL પેસ્ટ કરો..."
              placeholderTextColor={theme.textSecondary}
              value={imageUrl}
              onChangeText={setImageUrl}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>કેટેગરી પસંદ કરો*</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceMuted,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text style={[styles.catChipText, { color: active ? '#ffffff' : theme.text }]}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: theme.text }]}>વર્ણન (Description)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
            placeholder="સ્પષ્ટીકરણ, મટિરિયલ, વોરંટી વગેરે..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Sizes and Rates Table */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              સાઇઝ, ખરીદ ભાવ & વેચાણ ભાવ
            </Text>
            <Pressable style={styles.addSizeBtn} onPress={handleAddSizeRow}>
              <Ionicons name="add" size={16} color="#ffffff" />
              <Text style={styles.addSizeBtnText}>સાઇઝ ઉમેરો</Text>
            </Pressable>
          </View>

          {variants.map((v, idx) => (
            <View key={idx} style={[styles.variantBox, { borderColor: theme.border }]}>
              <View style={styles.variantRowTop}>
                <Text style={styles.variantIndex}>#{idx + 1}</Text>
                <Pressable onPress={() => handleRemoveSizeRow(idx)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>

              <View style={styles.inputGrid}>
                <View style={styles.inputCol}>
                  <Text style={styles.smallLabel}>સાઇઝ (Size)*</Text>
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                    placeholder='દા.ત. 2", 2.5"'
                    placeholderTextColor={theme.textSecondary}
                    value={v.size}
                    onChangeText={(val) => handleUpdateVariantField(idx, 'size', val)}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.smallLabel}>ખરીદ ભાવ (₹)*</Text>
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                    placeholder="250"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={String(v.purchase_rate || '')}
                    onChangeText={(val) => handleUpdateVariantField(idx, 'purchase_rate', parseFloat(val) || 0)}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.smallLabel}>વેચાણ ભાવ (₹)*</Text>
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: '#e0f2fe', color: '#0284c7', borderColor: '#38bdf8' }]}
                    placeholder="306"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={String(v.selling_rate || '')}
                    onChangeText={(val) => handleUpdateVariantField(idx, 'selling_rate', parseFloat(val) || 0)}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.smallLabel}>પ્રારંભિક સ્ટોક</Text>
                  <TextInput
                    style={[styles.smallInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                    placeholder="50"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={String(v.current_stock || '')}
                    onChangeText={(val) => {
                      const num = parseInt(val) || 0;
                      handleUpdateVariantField(idx, 'current_stock', num);
                      handleUpdateVariantField(idx, 'opening_stock', num);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Pressable style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Ionicons name="checkmark-done" size={20} color="#ffffff" />
          <Text style={styles.saveBtnText}>પ્રોડક્ટ સેવ કરો</Text>
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
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addSizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  addSizeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  variantBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  variantRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputCol: {
    width: '48%',
    gap: 4,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  smallInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '800',
  },
  imageSectionBox: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 101, 52, 0.04)',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 6,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewBox: {
    width: 68,
    height: 68,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#166534',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  imageActionButtons: {
    flex: 1,
    gap: 6,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  cameraBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});

