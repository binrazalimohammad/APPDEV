import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { userLogout } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';

type Props = {
  compact?: boolean;
};

const HeaderLogoutButton = ({ compact = false }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((s: RootState) => s.auth);
  const logoutError = useSelector((s: RootState) => s.auth.errorMessage);
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    if (logoutError && logoutError !== lastError.current) {
      lastError.current = logoutError;
      Alert.alert('Sign out failed', logoutError);
    }
  }, [logoutError]);

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Account';
  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onPress = () => {
    if (isLoading) {
      return;
    }
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => dispatch(userLogout()),
      },
    ]);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && !isLoading && styles.pressed,
        isLoading && styles.loading,
      ]}
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, sign out`}
      hitSlop={6}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.error} />
      ) : (
        <View style={styles.row}>
          <View style={[styles.avatar, compact && styles.avatarCompact]}>
            <Text style={[styles.avatarText, compact && styles.avatarTextCompact]}>{initials}</Text>
          </View>
          {!compact ? (
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
          ) : null}
          <Text style={styles.divider}>|</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.surface,
    maxWidth: 200,
  },
  buttonCompact: {
    maxWidth: 120,
    paddingHorizontal: SPACING.xs,
  },
  pressed: {
    backgroundColor: COLORS.errorMuted,
  },
  loading: {
    minWidth: 72,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarText: {
    ...FONT.caption,
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  avatarTextCompact: {
    fontSize: 10,
  },
  name: {
    ...FONT.caption,
    color: COLORS.text,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: 88,
  },
  divider: {
    ...FONT.caption,
    color: COLORS.textMuted,
  },
  logoutLabel: {
    ...FONT.caption,
    color: COLORS.error,
    fontWeight: '700',
  },
});

export default HeaderLogoutButton;
