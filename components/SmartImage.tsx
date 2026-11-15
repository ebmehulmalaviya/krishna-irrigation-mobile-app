import React, { useState } from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SmartImageProps {
  uri?: string;
  source?: ImageSourcePropType;
  icon?: string;
  fallbackColor?: string;
  style?: any;
  width?: number;
  height?: number;
  borderRadius?: number;
  badgeText?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  uri,
  source,
  icon = 'water',
  fallbackColor = '#15803d',
  style,
  width = 80,
  height = 80,
  borderRadius = 10,
  badgeText = 'KRISHNA',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(uri || source));

  const showFallback = hasError || (!uri && !source);

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius, backgroundColor: '#f0fdf4' },
        style,
      ]}
    >
      {!showFallback ? (
        <Image
          source={source || { uri }}
          style={[styles.image, { width, height, borderRadius }]}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : null}

      {/* Fallback Graphic */}
      {showFallback && (
        <View style={[styles.fallbackBox, { borderRadius }]}>
          <Ionicons name={icon as any} size={width * 0.42} color={fallbackColor} />
          {badgeText ? (
            <Text style={[styles.badgeText, { color: fallbackColor }]}>
              {badgeText}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallbackBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});

