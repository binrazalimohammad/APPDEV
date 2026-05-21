import { StyleSheet, Text, View } from 'react-native';

import { getRoleLabel, ROLE_BADGE_COLORS, type PrimaryRole } from '../../utils/roles';

type Props = {
  role: PrimaryRole | string;
};

const RoleBadge = ({ role }: Props) => {
  const key = (role in ROLE_BADGE_COLORS ? role : 'ROLE_TENANT') as PrimaryRole;
  const colors = ROLE_BADGE_COLORS[key];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{getRoleLabel(role)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default RoleBadge;
