import { StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

/** Minimal multicolor Google mark (no extra dependencies). */
const GoogleMark = ({ size = 20, style }: Props) => {
  const half = size / 2;
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.2 }, style]}>
      <View style={[styles.quad, { width: half, height: half, backgroundColor: '#4285F4' }]} />
      <View style={[styles.quad, { width: half, height: half, backgroundColor: '#EA4335' }]} />
      <View style={[styles.quad, { width: half, height: half, backgroundColor: '#FBBC05' }]} />
      <View style={[styles.quad, { width: half, height: half, backgroundColor: '#34A853' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  quad: {},
});

export default GoogleMark;
