import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import type { RegisterRole } from '../../app/api/types';
import { userRegister, userGoogleLogin } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import AuthFormLayout from '../../components/AuthFormLayout';
import AccountRolePicker from '../../components/AccountRolePicker';
import AuthButtonStack from '../../components/AuthButtonStack';
import BrandLogo from '../../components/BrandLogo';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import FormDivider from '../../components/FormDivider';
import FormFlash from '../../components/FormFlash';
import GoogleMark from '../../components/icons/GoogleMark';
import type { AuthStackParamList } from '../../navigation/types';
import { validateRegisterForm } from '../../utils/registerValidation';
import { formStyles } from '../../utils/formStyles';
import { ROUTES, SPACING } from '../../utils';

type Nav = StackNavigationProp<AuthStackParamList, typeof ROUTES.REGISTER>;

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('ROLE_TENANT');
  const [formError, setFormError] = useState<string | null>(null);
  const { isRegistering, isLoading, registerErrorMessage, error, errorMessage } = useSelector(
    (s: RootState) => s.auth,
  );
  const loading = isRegistering || isLoading;
  const displayError = registerErrorMessage ?? error ?? errorMessage;

  useFocusEffect(
    useCallback(() => {
      setFormError(null);
    }, []),
  );

  const isRenter = role === 'ROLE_TENANT';

  const onRegister = async () => {
    setFormError(null);
    const validationError = validateRegisterForm({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    dispatch(
      userRegister({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
      }),
    );
  };

  const onGoogleRegister = () => {
    setFormError(null);
    dispatch(userGoogleLogin({ role }));
  };

  return (
    <AuthFormLayout cardStyle={styles.wideCard}>
      <BrandLogo size="md" style={styles.logoCenter} />
      <Text style={formStyles.displayTitle}>
        {isRenter ? 'Create renter account' : 'Create landlord account'}
      </Text>
      <Text style={formStyles.authSub}>
        Join CasaClick to find properties and manage bookings
      </Text>

      {displayError ? <FormFlash message={displayError} variant="error" /> : null}

      <AccountRolePicker value={role} onChange={setRole} disabled={loading} />

      <AuthButtonStack>
        <CustomButton
          variant="google"
          label="Sign up with Google"
          icon={<GoogleMark size={20} />}
          onPress={onGoogleRegister}
          disabled={loading}
        />
      </AuthButtonStack>

      <FormDivider label="or register with email" />

      {formError ? <FormFlash message={formError} variant="error" /> : null}

      <CustomTextInput
        label="Full name"
        icon="👤"
        placeholder="Your full name"
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
        editable={!loading}
      />
      <CustomTextInput
        label="Email address"
        icon="✉"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!loading}
      />
      <CustomTextInput
        label="Phone number"
        icon="📱"
        placeholder="09XX XXX XXXX"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <CustomTextInput
        label="Password"
        icon="🔒"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="off"
        editable={!loading}
      />
      <CustomTextInput
        label="Confirm password"
        icon="🔒"
        placeholder="Repeat password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="off"
        editable={!loading}
      />

      <AuthButtonStack gap={SPACING.md}>
        <CustomButton
          variant="primary"
          label={isRenter ? 'Create account' : 'Create landlord account'}
          onPress={onRegister}
          disabled={loading}
          loading={loading}
        />
      </AuthButtonStack>

      <Text style={formStyles.hintText}>
        You&apos;ll go straight to your dashboard after registration.
      </Text>

      <View style={formStyles.authFooter}>
        <View style={formStyles.footerRow}>
          <Text style={formStyles.authFooterText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            disabled={loading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={formStyles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthFormLayout>
  );
};

const styles = StyleSheet.create({
  wideCard: {
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  logoCenter: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
});

export default RegisterScreen;
