import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryGridCard } from '@/components/CategoryGridCard';
import { useApp } from '@/context/AppContext';
import { Category } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, products, role } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Status bar top inset: guarantees header is pushed down below phone time, battery & notch
  const topInset = Platform.OS === 'android'
    ? Math.max(RNStatusBar.currentHeight || 0, insets.top, 32)
    : insets.top;

  // Top-level root categories (parent_id is null or undefined)
  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parent_id && c.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [categories]);

  // Filtered categories if search active
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return rootCategories;
    const q = searchQuery.toLowerCase().trim();
    return rootCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.name_en && c.name_en.toLowerCase().includes(q))
    );
  }, [rootCategories, searchQuery]);

  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <CategoryGridCard
        category={item}
        onPress={() => router.push(`/category/${item.id}` as any)}
      />
    );
  };

  return (
    <View style={styles.root}>
      {/* 1. Light Green Status Bar matching Screenshot 1 */}
      <StatusBar style="dark" />
      <View style={[styles.statusBarCover, { height: topInset }]} />

      {/* 2. Top Header - Clean, Premium & Polished */}
      <View style={styles.header}>
        {/* Left: Orange Rounded Menu Icon */}
        <Pressable
          style={({ pressed }) => [styles.orangeMenuBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/modal' as any)}
        >
          <View style={styles.menuLinesBox}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </Pressable>

        {/* Center: Clean Brand Title */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            KRISHNA IRRIGATION
          </Text>
        </View>

        {/* Right: Search & Notification Buttons */}
        <View style={styles.headerRight}>
          <Pressable
            style={({ pressed }) => [
              styles.orangeRoundBtn,
              showSearch && styles.orangeRoundBtnActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search'}
              size={18}
              color={showSearch ? '#ffffff' : '#f97316'}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.orangeRoundBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/modal' as any)}
          >
            <Ionicons name="notifications" size={18} color="#f97316" />
            {role === 'admin' && <View style={styles.adminIndicatorDot} />}
          </Pressable>
        </View>
      </View>

      {/* Optional Search Bar toggle */}
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="પ્રોડક્ટ અથવા કેટેગરી શોધો..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      )}

      {/* 3. Hero Carousel Banner matching Screenshot 1 */}
      <View style={styles.bannerSection}>

        {/* Quick Action Button for Admin to Add Category or Product */}
        {role === 'admin' && (
          <View style={styles.quickActionsBar}>
            <Pressable
              style={styles.addCategoryPill}
              onPress={() => router.push('/admin/categories' as any)}
            >
              <Ionicons name="add-circle" size={15} color="#ffffff" />
              <Text style={styles.addCategoryText}>+ નવી કેટેગરી ઉમેરો</Text>
            </Pressable>

            <Pressable
              style={styles.addProductPill}
              onPress={() => router.push('/admin/add-product' as any)}
            >
              <Ionicons name="pricetag" size={14} color="#ffffff" />
              <Text style={styles.addProductText}>+ નવી પ્રોડક્ટ ઉમેરો</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 4. Two-Column Category Grid matching Screenshot 1 */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={38} color="#94a3b8" />
            <Text style={styles.emptyText}>કોઈ કેટેગરી મળી નથી</Text>
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
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orangeMenuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLinesBox: {
    width: 19,
    gap: 3.5,
  },
  menuLine: {
    height: 2.5,
    backgroundColor: '#f97316',
    borderRadius: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#166534', // Brand deep green
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orangeRoundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orangeRoundBtnActive: {
    backgroundColor: '#f97316',
    borderColor: '#ea580c',
  },
  adminIndicatorDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  // Banner Section (Screenshot 1)
  bannerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  bannerTextBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1.5,
  },
  bannerSubtitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1.2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#166534', // Green active pill dot
  },
  // Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  addCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#166534',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  addCategoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  addProductPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ca8a04',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#ca8a04',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  addProductText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  // Grid
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
});
