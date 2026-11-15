import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';
import { IrrigationGraphic } from './IrrigationGraphic';

interface ProductRateCardProps {
  product: Product;
  isAdmin?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
}

export const ProductRateCard: React.FC<ProductRateCardProps> = ({
  product,
  isAdmin = false,
  onPress,
  onEdit,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Active variants
  const activeVariants = product.variants.filter((v) => v.is_active !== false);

  // Format price like screenshot: "₹ 306.0"
  const formatPrice = (rate: number) => {
    return `₹ ${rate.toFixed(1)}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        {
          opacity: pressed ? 0.96 : 1,
        },
      ]}
      onPress={onPress}
    >
      {/* Top / Main Row: Left Image Box + Right Content */}
      <View style={styles.contentRow}>
        {/* Left Side: Product Image Box with SKU Badge on top-left (Screenshot 2) */}
        <View style={styles.imageBox}>
          {/* Top-Left Black SKU Badge: e.g. "1 P", "1 T", "2A", "3 P" */}
          {product.sku && (
            <View style={styles.skuBadge}>
              <Text style={styles.skuBadgeText}>{product.sku}</Text>
            </View>
          )}

          {/* Product Image / Vector Graphic */}
          <View style={styles.graphicHolder}>
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={styles.imageAsset}
                resizeMode="contain"
              />
            ) : (
              <IrrigationGraphic
                type={(product.graphic_type as any) || 'union-valve'}
                width={70}
                height={70}
              />
            )}
          </View>
        </View>

        {/* Right Side: Title + 3-Tiered Size/Rate Table (Screenshot 2) */}
        <View style={styles.rightSection}>
          {/* Title Row with Edit button for Admin */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.name}
            </Text>

            {isAdmin && onEdit && (
              <Pressable style={styles.editBtn} onPress={onEdit}>
                <Ionicons name="create-outline" size={18} color="#15803d" />
              </Pressable>
            )}
          </View>

          {/* 3-Tiered Rate Table: Columns of [Red Size / Blue Price / White જથ્થો] (Screenshot 2) */}
          <View style={styles.rateTable}>
            {activeVariants.map((variant) => (
              <View key={variant.id} style={styles.rateColumn}>
                {/* 1. Red Box: Size (e.g. 2", 2.5", 3") */}
                <View style={styles.sizeCellRed}>
                  <Text style={styles.sizeCellText} numberOfLines={1}>
                    {variant.size}
                  </Text>
                </View>

                {/* 2. Blue Box: Selling Rate (e.g. ₹ 306.0, ₹ 410.0, ₹ 590.0) */}
                <View style={styles.priceCellBlue}>
                  <Text style={styles.priceCellText} numberOfLines={1}>
                    {formatPrice(variant.selling_rate)}
                  </Text>
                </View>

                {/* 3. White Box: Pack / Qty (જથ્થો) */}
                <View style={styles.packCellWhite}>
                  <Text style={styles.packCellText} numberOfLines={1}>
                    {variant.pack_text || 'જથ્થો'}
                  </Text>
                </View>

                {/* Admin Stock Info underneath */}
                {isAdmin && (
                  <View style={styles.adminVariantMeta}>
                    <Text style={styles.adminMetaRate}>ખરીદ: ₹{variant.purchase_rate}</Text>
                    <Text
                      style={[
                        styles.adminMetaStock,
                        {
                          color:
                            variant.current_stock <= variant.low_stock_limit
                              ? '#dc2626'
                              : '#15803d',
                        },
                      ]}
                    >
                      સ્ટોક: {variant.current_stock}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#166534', // Distinct dark green border (Screenshot 2)
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  // Left Side Image Box (Screenshot 2)
  imageBox: {
    width: 82,
    height: 92,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#166534', // Inner green border
    backgroundColor: '#ffffff',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  skuBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#0f172a', // Solid black SKU tag (Screenshot 2: 1 P, 1 T, 2A, 3 P)
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 5,
  },
  skuBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  graphicHolder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  imageAsset: {
    width: 72,
    height: 72,
  },
  // Right Side Section (Screenshot 2)
  rightSection: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  productTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 20,
  },
  editBtn: {
    padding: 2,
    marginLeft: 4,
  },
  // 3-Tiered Rate Table (Screenshot 2)
  rateTable: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 4,
  },
  rateColumn: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  // Row 1: Red Size Header (Screenshot 2)
  sizeCellRed: {
    backgroundColor: '#f03e3e', // Solid vibrant red
    paddingVertical: 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeCellText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  // Row 2: Blue Rate Cell (Screenshot 2)
  priceCellBlue: {
    backgroundColor: '#1d72f2', // Solid bright royal blue
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceCellText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  // Row 3: White Pack Text (Screenshot 2)
  packCellWhite: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packCellText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Admin only extra info
  adminVariantMeta: {
    backgroundColor: '#f8fafc',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    padding: 2,
    alignItems: 'center',
  },
  adminMetaRate: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '600',
  },
  adminMetaStock: {
    fontSize: 8,
    fontWeight: '800',
  },
});
