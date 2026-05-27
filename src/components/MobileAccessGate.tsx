import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { userLogout } from '../app/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import CustomButton from './CustomButton';
import { COLORS, FONT, SPACING } from '../utils';
import { getPrimaryRole } from '../utils/roles';

type Props = {
  children: ReactNode;
};

/**
 * Mobile app is for tenants and landlords. Staff/admin accounts must use the web dashboard.
 */
const MobileAccessGate = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const role = getPrimaryRole(user);

  if (role === 'ROLE_ADMIN' || role === 'ROLE_STAFF') {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Web dashboard only</Text>
        <Text style={styles.body}>
          {role === 'ROLE_ADMIN' ? 'Admin' : 'Staff'} accounts use the CasaClick website, not this
          mobile customer app. Sign out and log in as a renter or landlord to continue.
        </Text>
        <Text style={styles.hint}>
          API returns 403 on /api/mobile/customer/* for staff — this screen enforces the same rule in
          the UI (RBAC).
        </Text>
        <CustomButton
          variant="primary"
          label="Sign out"
          onPress={() => dispatch(userLogout())}
          containerStyle={styles.btn}
        />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    ...FONT.headline,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  body: {
    ...FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  hint: {
    ...FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 18,
  },
  btn: {
    maxWidth: 280,
    alignSelf: 'center',
  },
});

export default MobileAccessGate;
