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
  const bgColor = category.color || '#bfe9e4';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: bgColor,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      {/* Center Image / Vector Graphic Cluster (Screenshot 1) */}
      <View style={styles.graphicArea}>
        {category.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.imageAsset}
            resizeMode="contain"
          />
        ) : (
          <IrrigationGraphic
            type={(category.graphic_type as any) || 'cat-valves'}
            width={110}
            height={75}
          />
        )}
      </View>

      {/* Bottom Category Name in Gujarati (Screenshot 1) */}
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
    height: 146,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  graphicArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  imageAsset: {
    width: 100,
    height: 70,
  },
  titleArea: {
    width: '100%',
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 18,
  },
});
