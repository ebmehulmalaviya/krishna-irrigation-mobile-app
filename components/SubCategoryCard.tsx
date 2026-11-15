import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { IrrigationGraphic } from './IrrigationGraphic';

export interface SubCategoryCardProps {
  id: string;
  name: string;
  name_en?: string;
  image_url?: string | null;
  graphic_type?: string;
  color?: string;
  productCount?: number;
  isSelected?: boolean;
  onPress: () => void;
  isAllCard?: boolean;
}

export const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  id,
  name,
  name_en,
  image_url,
  graphic_type,
  color,
  productCount,
  isSelected = false,
  onPress,
  isAllCard = false,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected ? styles.cardSelected : styles.cardDefault,
        color && !isSelected ? { backgroundColor: color + '15' } : null,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Active Checkmark Pill in Top-Right Corner */}
      {isSelected && (
        <View style={styles.activePill}>
          <Ionicons name="checkmark" size={11} color="#ffffff" />
        </View>
      )}

      {/* Visual Image / Graphic Area */}
      <View
        style={[
          styles.visualHolder,
          isSelected ? styles.visualHolderSelected : styles.visualHolderDefault,
          color && !isSelected ? { backgroundColor: color + '30' } : null,
        ]}
      >
        {isAllCard ? (
          <View style={styles.allIconCircle}>
            <Ionicons
              name="grid"
              size={24}
              color={isSelected ? '#166534' : '#64748b'}
            />
          </View>
        ) : image_url ? (
          <Image
            source={{ uri: image_url }}
            style={styles.cardImage}
            resizeMode="contain"
          />
        ) : (
          <IrrigationGraphic
            type={(graphic_type as any) || 'union-valve'}
            width={54}
            height={40}
          />
        )}
      </View>

      {/* Subcategory Gujarati Title */}
      <View style={styles.titleArea}>
        <Text
          style={[styles.titleText, isSelected && styles.titleTextSelected]}
          numberOfLines={2}
        >
          {name}
        </Text>
      </View>

      {/* Bottom Product Count Badge */}
      {typeof productCount === 'number' && (
        <View
          style={[
            styles.countBadge,
            isSelected ? styles.countBadgeSelected : styles.countBadgeDefault,
          ]}
        >
          <Text
            style={[
              styles.countText,
              isSelected ? styles.countTextSelected : styles.countTextDefault,
            ]}
          >
            {isAllCard ? `${productCount} કુલ` : `${productCount} આઇટમ`}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 110,
    minHeight: 138,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginRight: 10,
  },
  cardDefault: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#166534',
    shadowColor: '#166534',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  activePill: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  visualHolder: {
    width: '100%',
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 2,
  },
  visualHolderDefault: {
    backgroundColor: '#f8fafc',
  },
  visualHolderSelected: {
    backgroundColor: '#dcfce7',
  },
  allIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '88%',
    height: '88%',
  },
  titleArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 16,
  },
  titleTextSelected: {
    color: '#166534',
    fontWeight: '900',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginTop: 2,
  },
  countBadgeDefault: {
    backgroundColor: '#f1f5f9',
  },
  countBadgeSelected: {
    backgroundColor: '#166534',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  countTextDefault: {
    color: '#64748b',
  },
  countTextSelected: {
    color: '#ffffff',
  },
});

