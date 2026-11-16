import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../types';
import { IrrigationGraphic } from './IrrigationGraphic';

interface CategoryGridCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryGridCard: React.FC<CategoryGridCardProps> = ({
  category,
  onPress,
}) => {
  const accentColor = category.color || '#bfe9e4';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      {/* Top Image / Graphic Showcase Frame */}
      <View
        style={[
          styles.graphicFrame,
          { backgroundColor: accentColor ? `${accentColor}28` : '#f8fafc' },
        ]}
      >
        {category.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.imageAsset}
            resizeMode="contain"
          />
        ) : (
          <IrrigationGraphic
            type={(category.graphic_type as any) || 'cat-valves'}
            width={112}
            height={78}
          />
        )}
      </View>

      {/* Bottom Category Name in Gujarati */}
      <View style={styles.titleArea}>
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 6,
    height: 156,
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#ffffff', // Pure white card background
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  graphicFrame: {
    width: '100%',
    height: 98,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageAsset: {
    width: '92%',
    height: '92%',
  },
  titleArea: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 18,
  },
});
