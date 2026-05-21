import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTenantSidebarOptional } from '../../contexts/TenantSidebarContext';
import { COLORS, SPACING } from '../../utils/theme';

const TenantHeaderLeft = () => {
  const navigation = useNavigation();
  const sidebar = useTenantSidebarOptional();
  const canGoBack = navigation.canGoBack();

  if (!sidebar) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.menuBtn}
        onPress={sidebar.toggle}
        accessibilityLabel="Open menu"
        hitSlop={8}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      {canGoBack ? (
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  menuBtn: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  backBtn: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 28,
  },
});

export default TenantHeaderLeft;
