import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import AuthFormLayout from '../../components/AuthFormLayout';
import AuthButtonStack from '../../components/AuthButtonStack';
import BrandLogo from '../../components/BrandLogo';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import FormDivider from '../../components/FormDivider';
import FormFlash from '../../components/FormFlash';
import GoogleMark from '../../components/icons/GoogleMark';
import { clearAuthError, userGoogleLogin, userLogin } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import type { AuthStackParamList } from '../../navigation/types';
import { formStyles } from '../../utils/formStyles';
import { ROUTES, SPACING } from '../../utils';

type Nav = StackNavigationProp<AuthStackParamList, typeof ROUTES.LOGIN>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, errorMessage } = useSelector((s: RootState) => s.auth);
  const displayError = error ?? errorMessage;

  useFocusEffect(
    useCallback(() => {
      dispatch(clearAuthError());
    }, [dispatch]),
  );

  const handleLogin = () => {
    if (emailAdd.trim() === '' || password.trim() === '') {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }
    dispatch(userLogin({ email: emailAdd.trim(), password }));
  };

  return (
    <AuthFormLayout edges={['bottom']}>
      <BrandLogo size="md" style={styles.logo} />
      <Text style={formStyles.displayTitle}>Welcome back</Text>
      <Text style={formStyles.authSub}>Sign in to your CasaClick account</Text>

      {displayError ? <FormFlash message={displayError} variant="error" /> : null}

      <View style={formStyles.demoPill}>
        <Text style={formStyles.demoPillText}>
          Demo: <Text style={formStyles.demoPillStrong}>tenant@example.com</Text> / tenant2222
        </Text>
      </View>

      <CustomTextInput
        label="Email address"
        icon="✉"
        placeholder="you@example.com"
        value={emailAdd}
        onChangeText={setEmailAdd}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isLoading}
      />

      <CustomTextInput
        label="Password"
        icon="🔒"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="off"
        editable={!isLoading}
      />

      <AuthButtonStack gap={SPACING.md}>
        <CustomButton
          variant="primary"
          label="Sign in"
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
        />
      </AuthButtonStack>

      <FormDivider label="or" />

      <CustomButton
        variant="google"
        label="Continue with Google"
        icon={<GoogleMark size={20} />}
        onPress={() => dispatch(userGoogleLogin({ role: 'ROLE_TENANT' }))}
        disabled={isLoading}
      />

      <View style={formStyles.authFooter}>
        <View style={formStyles.footerRow}>
          <Text style={formStyles.authFooterText}>Don&apos;t have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={formStyles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthFormLayout>
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
});

export default LoginScreen;
