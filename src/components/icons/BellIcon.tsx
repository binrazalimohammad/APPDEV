import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../utils/theme';

type Props = {
  size?: number;
  color?: string;
};

/** Minimal bell icon built from Views (no icon font dependency). */
const BellIcon = ({ size = 20, color = COLORS.primary }: Props) => {
  const bellW = size * 0.72;
  const bellH = size * 0.62;
  const clapper = size * 0.14;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.bell,
          {
            width: bellW,
            height: bellH,
            borderColor: color,
            borderTopLeftRadius: bellW / 2,
            borderTopRightRadius: bellW / 2,
          },
        ]}
      />
      <View
        style={[
          styles.clapper,
          {
            width: clapper,
            height: clapper,
            borderRadius: clapper / 2,
            backgroundColor: color,
            marginTop: 1,
          },
        ]}
      />
      <View
        style={[
          styles.handle,
          {
            width: size * 0.18,
            height: size * 0.12,
            borderColor: color,
            top: size * 0.08,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bell: {
    borderWidth: 2,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  clapper: {},
  handle: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
});

export default BellIcon;
