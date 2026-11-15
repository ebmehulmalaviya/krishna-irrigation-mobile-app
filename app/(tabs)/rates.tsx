import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';
import { ProductRateCard } from '@/components/ProductRateCard';
import { Product } from '@/types';

export default function RatesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { products, categories, role } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active categories for filter tabs
  const categoryFilters = useMemo(() => {
    const list = categories.filter((c) => c.is_active);
    return [{ id: 'all', name: 'બધા ઉત્પાદનો' }, ...list];
  }, [categories]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active && role !== 'admin') return false;

      const matchesCat =
        selectedCategoryId === 'all' ||
        p.category_id === selectedCategoryId ||
        p.subcategory_id === selectedCategoryId;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        (p.name_en && p.name_en.toLowerCase().includes(q)) ||
        p.variants.some((v) => v.size.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery, role]);

  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <ProductRateCard
        product={item}
        isAdmin={role === 'admin'}
        onEdit={() => router.push(`/admin/add-product?productId=${item.id}` as any)}
        onPress={() => {
          // If admin, can navigate to edit; if user, view rate
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder='વાલ્વ, ફિટિંગ્સ, સાઇઝ (2", 3") શોધો...'
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal Category Filter Pills */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categoryFilters.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? '#ffffff' : theme.text,
                      fontWeight: isSelected ? '800' : '500',
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Admin Quick Add Floating/Header Bar */}
      {role === 'admin' && (
        <View style={styles.adminBar}>
          <Pressable
            style={[styles.adminAddBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/admin/add-product' as any)}
          >
            <Ionicons name="add-circle" size={18} color="#ffffff" />
            <Text style={styles.adminAddBtnText}>નવી પ્રોડક્ટ & સાઇઝ ઉમેરો</Text>
          </Pressable>
        </View>
      )}

      {/* List of Products (Screenshot 1 UI) */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              કોઈ પ્રોડક્ટ મળી નથી
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              બીજી કેટેગરી પસંદ કરો અથવા સર્ચ ફિલ્ટર ક્લીયર કરો.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScrollWrapper: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 14,
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  adminBar: {
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  adminAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  adminAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
