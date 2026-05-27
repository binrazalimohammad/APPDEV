import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT, SPACING } from '../utils/theme';

const FormDivider = ({ label = 'or' }: { label?: string }) => (
  <View style={styles.row}>
    <View style={styles.line} />
    <Text style={styles.label}>{label}</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.line,
  },
  label: {
    ...FONT.caption,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default FormDivider;
