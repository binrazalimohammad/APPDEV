import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../utils/theme';

export type LogoutButtonProps = {
  onLogout: () => void;
  label?: string;
};

const LogoutButton = ({ onLogout, label = 'Sign out' }: LogoutButtonProps) => {
  const handlePress = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 160,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
    letterSpacing: 0.2,
  },
});

export default LogoutButton;
