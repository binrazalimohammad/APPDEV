import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { COLORS, RADIUS, SPACING } from '../utils/theme';

export type CustomTextInputProps = {
  placeholder?: string;
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'off' | 'username';
  editable?: boolean;
  icon?: string;
  error?: string;
  multiline?: boolean;
  labelVariant?: 'auth' | 'form';
};

const CustomTextInput = ({
  placeholder,
  label,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  editable = true,
  icon,
  error,
  multiline,
  labelVariant = 'auth',
}: CustomTextInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]} collapsable={false}>
      {label ? (
        <Text style={[styles.label, labelVariant === 'form' && styles.labelForm]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error ? styles.inputWrapError : null,
        ]}
      >
        {icon ? (
          <View style={styles.iconSlot} pointerEvents="none">
            <Text style={styles.icon}>{icon}</Text>
          </View>
        ) : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          selectionColor={COLORS.primary}
          underlineColorAndroid="transparent"
          importantForAutofill={secureTextEntry ? 'no' : 'yes'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            multiline ? styles.inputMultiline : null,
            Platform.OS === 'android' ? styles.inputAndroid : null,
            textStyle,
          ]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md + 2,
    width: '100%',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.brown,
    marginBottom: SPACING.xs + 2,
  },
  labelForm: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#C9A46D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  inputWrapError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorMuted,
  },
  iconSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  input: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'android' ? 48 : undefined,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
    paddingHorizontal: SPACING.md,
    paddingLeft: SPACING.md,
  },
  inputAndroid: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default CustomTextInput;
