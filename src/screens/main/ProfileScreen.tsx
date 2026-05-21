import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { updateMobileProfile } from '../../app/api/profile';
import { refreshProfile, userLogout } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import RoleBadge from '../../components/dashboard/RoleBadge';
import FormFlash from '../../components/FormFlash';
import LogoutButton from '../../components/LogoutButton';
import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils';
import { getPrimaryRole } from '../../utils/roles';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading } = useSelector((s: RootState) => s.auth);
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo') {
      dispatch(refreshProfile());
    }
  }, [dispatch, token]);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const initials =
    (user?.name || user?.email || 'CC')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CC';

  const onSave = async () => {
    if (!token || token === 'demo') {
      Alert.alert('Sign in required', 'Use email or Google login so changes save to the database.');
      return;
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setSaveError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      await updateMobileProfile(token, { name: trimmed });
      await dispatch(refreshProfile());
      setSaveOk(true);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Changes sync to CasaClick (MySQL)</Text>

      {saveError ? <FormFlash message={saveError} variant="error" /> : null}
      {saveOk ? <FormFlash message="Profile saved to the server." variant="success" /> : null}

      <View style={[styles.card, ELEVATION.card]}>
        <View style={styles.avatar}>
          {isLoading && !user?.name ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <CustomTextInput
          label="Display name"
          icon="👤"
          placeholder="Your name"
          value={name}
          onChangeText={text => {
            setName(text);
            setSaveOk(false);
          }}
          editable={!saving && Boolean(token && token !== 'demo')}
        />
        {user?.email ? <Text style={styles.emailReadonly}>{user.email}</Text> : null}
        <View style={styles.roleWrap}>
          <RoleBadge role={getPrimaryRole(user)} />
        </View>
        {user?.emailVerified === false ? (
          <Text style={styles.warn}>Email not verified — check your inbox on the web.</Text>
        ) : null}
        <CustomButton
          variant="secondary"
          label="Save profile"
          onPress={onSave}
          disabled={saving || !token || token === 'demo'}
          loading={saving}
          containerStyle={styles.saveBtn}
        />
      </View>

      <View style={[styles.row, styles.card, ELEVATION.card]}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Security</Text>
          <Text style={styles.rowHint}>Sign out on shared devices after use.</Text>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <LogoutButton onLogout={() => dispatch(userLogout())} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    ...FONT.title,
    fontSize: 26,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  emailReadonly: {
    ...FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  roleWrap: {
    marginTop: SPACING.sm,
    alignSelf: 'center',
  },
  warn: {
    ...FONT.caption,
    color: COLORS.warning,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...FONT.bodyStrong,
    color: COLORS.text,
  },
  rowHint: {
    ...FONT.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  logoutSection: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
});

export default ProfileScreen;
