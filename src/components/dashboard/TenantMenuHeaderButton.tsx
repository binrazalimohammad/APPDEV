import { Pressable, StyleSheet, Text } from 'react-native';

import { useTenantSidebarOptional } from '../../contexts/TenantSidebarContext';
import { COLORS, SPACING } from '../../utils/theme';

const TenantMenuHeaderButton = () => {
  const sidebar = useTenantSidebarOptional();
  if (!sidebar) {
    return null;
  }

  return (
    <Pressable
      style={styles.btn}
      onPress={sidebar.toggle}
      accessibilityLabel="Open menu"
      hitSlop={8}
    >
      <Text style={styles.icon}>☰</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
  },
  icon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default TenantMenuHeaderButton;
