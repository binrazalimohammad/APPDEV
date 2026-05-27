import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RegisterRole } from '../app/api/types';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

type Props = {
  value: RegisterRole;
  onChange: (role: RegisterRole) => void;
  disabled?: boolean;
};

const OPTIONS: { role: RegisterRole; label: string; description: string }[] = [
  {
    role: 'ROLE_TENANT',
    label: 'Renter',
    description: 'Browse & book properties',
  },
  {
    role: 'ROLE_LANDLORD',
    label: 'Landlord',
    description: 'List units & manage bookings',
  },
];

const AccountRolePicker = ({ value, onChange, disabled }: Props) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>Account type</Text>
    <View style={styles.segmented}>
      {OPTIONS.map(opt => {
        const selected = value === opt.role;
        return (
          <Pressable
            key={opt.role}
            disabled={disabled}
            onPress={() => onChange(opt.role)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && !disabled && styles.optionPressed,
              disabled && styles.optionDisabled,
            ]}
          >
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {opt.label}
            </Text>
            <Text style={[styles.optionDesc, selected && styles.optionDescSelected]} numberOfLines={2}>
              {opt.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONT.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  segmented: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundSoft,
    padding: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  optionLabel: {
    ...FONT.bodyStrong,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: COLORS.primaryDark,
  },
  optionDesc: {
    ...FONT.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 14,
    textAlign: 'center',
  },
  optionDescSelected: {
    color: COLORS.textSecondary,
  },
});

export default AccountRolePicker;
