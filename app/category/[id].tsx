import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { ProductRateCard } from '@/components/ProductRateCard';
import { IrrigationGraphic } from '@/components/IrrigationGraphic';
import { Product, Category } from '@/types';
import { uploadImageToSupabase } from '@/lib/storage';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, products, role, updateCategory } = useApp();

  // Status bar top inset: guarantees header is pushed down below phone time, battery & notch
  const topInset = Platform.OS === 'android'
    ? Math.max(RNStatusBar.currentHeight || 0, insets.top, 32)
    : insets.top;

  const currentCategory = categories.find((c) => c.id === id);

  // Change Category or Subcategory Photo
  const handleChangePhoto = async (cat: Category) => {
    Alert.alert(
      `"${cat.name}" નો ફોટો અપલોડ કરો`,
      'તમે ફોટો ક્યાંથી પસંદ કરવા માંગો છો?',
      [
        {
          text: '🖼️ ગેલેરીમાંથી પસંદ કરો',
          onPress: async () => {
            try {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
              });
              if (!res.canceled && res.assets[0]) {
                const cloudUrl = await uploadImageToSupabase(res.assets[0], 'categories');
                await updateCategory(cat.id, { image_url: cloudUrl });
                Alert.alert('સફળ!', `"${cat.name}" નો ફોટો ક્લાઉડ સ્ટોરેજ પર અપડેટ થઈ ગયો છે.`);
              }
            } catch (e) {
              Alert.alert('ભૂલ', 'ફોટો પસંદ કરવામાં ભૂલ આવી.');
            }
          },
        },
        {
          text: '📷 કેમેરાથી ફોટો પાડો',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('પરવાનગી જરૂરી', 'કેમેરા પરવાનગી આપો.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
              });
              if (!res.canceled && res.assets[0]) {
                const cloudUrl = await uploadImageToSupabase(res.assets[0], 'categories');
                await updateCategory(cat.id, { image_url: cloudUrl });
                Alert.alert('સફળ!', `"${cat.name}" નો ફોટો ક્લાઉડ સ્ટોરેજ પર અપડેટ થઈ ગયો છે.`);
              }
            } catch (e) {
              Alert.alert('ભૂલ', 'કેમેરા શરૂ કરવામાં ભૂલ આવી.');
            }
          },
        },
        { text: 'રદ કરો', style: 'cancel' },
      ]
    );
  };

  // Subcategories under this category
  const subcategories = useMemo(() => {
    return categories.filter((c) => c.parent_id === id && c.is_active);
  }, [categories, id]);

  const [selectedSubCatId, setSelectedSubCatId] = useState<string>('all');

  // Filter products for this category or selected subcategory
  const categoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active && role !== 'admin') return false;

      const belongsToCategory =
        p.category_id === id ||
        subcategories.some(
          (sub) => sub.id === p.category_id || sub.id === p.subcategory_id
        );

      if (!belongsToCategory) return false;

      if (selectedSubCatId !== 'all') {
        return p.subcategory_id === selectedSubCatId || p.category_id === selectedSubCatId;
      }

      return true;
    });
  }, [products, id, subcategories, selectedSubCatId, role]);

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <ProductRateCard
        product={item}
        isAdmin={role === 'admin'}
        onEdit={() => router.push(`/admin/add-product?productId=${item.id}` as any)}
      />
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Light Green Status Bar matching Screenshot 2 */}
      <StatusBar style="dark" />
      <View style={[styles.statusBarCover, { height: topInset }]} />

      {/* Top Header matching Screenshot 2 */}
      <View style={styles.header}>
        {/* Dark Green Circular Back Button (Screenshot 2) */}
        <Pressable style={styles.greenCircleBackBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </Pressable>

        {/* Centered Gujarati Category Title (Screenshot 2) */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentCategory?.name || 'એગ્રીકલ્ચર વાલ્વ'}
          </Text>
        </View>

        {/* Right action: Admin add button */}
        <View style={styles.headerRight}>
          {role === 'admin' ? (
            <Pressable
              style={styles.adminAddBtn}
              onPress={() => router.push('/admin/add-product' as any)}
            >
              <Ionicons name="add" size={22} color="#166534" />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>
      </View>

      {/* Subcategories Strip with Thumbnails (if any exist) */}
      {subcategories.length > 0 && (
        <View style={styles.subCatBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCatScroll}
          >
            {/* All Filter Pill */}
            <Pressable
              style={[
                styles.subCatPill,
                selectedSubCatId === 'all' && styles.subCatPillActive,
              ]}
              onPress={() => setSelectedSubCatId('all')}
            >
              <Text
                style={[
                  styles.subCatPillText,
                  selectedSubCatId === 'all' && styles.subCatPillTextActive,
                ]}
              >
                બધા ઉત્પાદનો ({categoryProducts.length})
              </Text>
            </Pressable>

            {/* Subcategories with image/graphic thumbnails */}
            {subcategories.map((sub) => {
              const isSelected = selectedSubCatId === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  style={[
                    styles.subCatPill,
                    isSelected && styles.subCatPillActive,
                  ]}
                  onPress={() => setSelectedSubCatId(sub.id)}
                >
                  <View style={styles.subThumbHolder}>
                    {sub.image_url ? (
                      <Image source={{ uri: sub.image_url }} style={styles.subThumbImg} />
                    ) : (
                      <IrrigationGraphic
                        type={(sub.graphic_type as any) || 'union-valve'}
                        width={20}
                        height={20}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.subCatPillText,
                      isSelected && styles.subCatPillTextActive,
                    ]}
                  >
                    {sub.name}
                  </Text>
                </Pressable>
              );
            })}

            {/* Quick Add Subcategory Pill */}
            {role === 'admin' && (
              <Pressable
                style={styles.addSubCatPill}
                onPress={() => router.push('/admin/categories' as any)}
              >
                <Ionicons name="add-circle" size={16} color="#166534" />
                <Text style={styles.addSubCatText}>+ નવી પેટા-કેટેગરી</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}

      {/* Product List with Screenshot 2 UI */}
      <FlatList
        data={categoryProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={44} color="#94a3b8" />
            <Text style={styles.emptyTitle}>આ કેટેગરીમાં હાલ કોઈ પ્રોડક્ટ્સ નથી</Text>
            {role === 'admin' && (
              <Pressable
                style={styles.addFirstBtn}
                onPress={() => router.push('/admin/add-product' as any)}
              >
                <Text style={styles.addFirstBtnText}>+ નવી પ્રોડક્ટ ઉમેરો</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBarCover: {
    width: '100%',
    backgroundColor: '#bcf3cb',
  },
  // Header matching Screenshot 2
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  greenCircleBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#166534', // Solid dark green circle (Screenshot 2)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#166534', // Dark green matching screenshot
  },
  headerRight: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPhotoAdminBar: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  catPhotoEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#166534',
    borderRadius: 10,
    padding: 8,
    gap: 10,
  },
  catPhotoThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  catPhotoImg: {
    width: '100%',
    height: '100%',
  },
  catPhotoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  catPhotoPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginTop: 1,
  },
  cameraIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Subcategories strip
  subCatBar: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  subCatScroll: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  subCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  subCatPillActive: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  subCatPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  subCatPillTextActive: {
    color: '#ffffff',
  },
  subThumbHolder: {
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subThumbImg: {
    width: '100%',
    height: '100%',
  },
  addSubCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  addSubCatText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 28,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  addFirstBtn: {
    backgroundColor: '#166534',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 6,
  },
  addFirstBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
