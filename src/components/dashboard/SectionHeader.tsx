import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT, SPACING } from '../../utils/theme';

type Props = {
  title: string;
  subtitle?: string;
};

const SectionHeader = ({ title, subtitle }: Props) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  title: {
    ...FONT.bodyStrong,
    fontSize: 17,
    color: COLORS.brown,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...FONT.caption,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
});

export default SectionHeader;
