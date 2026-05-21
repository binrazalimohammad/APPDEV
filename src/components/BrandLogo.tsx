import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, ELEVATION, FONT, SPACING } from '../utils/theme';
import IMG from '../utils/image';

export type BrandLogoSize = 'sm' | 'md' | 'lg';

type BrandLogoProps = {
  size?: BrandLogoSize;
  showBrandText?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

const SIZES: Record<BrandLogoSize, number> = {
  sm: 80,
  md: 120,
  lg: 140,
};

/**
 * Circular logo — matches website .logo-image (50% radius, white pad, shadow).
 */
const BrandLogo = ({
  size = 'md',
  showBrandText = false,
  style,
  imageStyle,
}: BrandLogoProps) => {
  const dim = SIZES[size];
  const pad = Math.round(dim * 0.1);

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.circle,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            padding: pad,
          },
        ]}
      >
        <Image
          source={IMG.CASACLICK}
          style={[
            styles.image,
            { width: dim - pad * 2, height: dim - pad * 2, borderRadius: (dim - pad * 2) / 2 },
            imageStyle,
          ]}
          resizeMode="contain"
          accessibilityLabel="CasaClick logo"
        />
      </View>
      {showBrandText ? <Text style={styles.brandText}>CASACLICK</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circle: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.card,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    marginBottom: SPACING.sm,
  },
  image: {
    backgroundColor: 'transparent',
  },
  brandText: {
    ...FONT.title,
    fontSize: 20,
    color: COLORS.brown,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
});

export default BrandLogo;
