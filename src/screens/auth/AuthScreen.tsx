import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import type { RegisterRole } from '../../app/api/types';
import AuthFormLayout from '../../components/AuthFormLayout';
import AccountRolePicker from '../../components/AccountRolePicker';
import AuthButtonStack from '../../components/AuthButtonStack';
import BrandLogo from '../../components/BrandLogo';
import CustomButton from '../../components/CustomButton';
import FormDivider from '../../components/FormDivider';
import FormFlash from '../../components/FormFlash';
import GoogleMark from '../../components/icons/GoogleMark';
import { clearAuthError, userGoogleLogin } from '../../app/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import type { AuthStackParamList } from '../../navigation/types';
import { formStyles } from '../../utils/formStyles';
import { COLORS, FONT, ROUTES, SPACING } from '../../utils';

type AuthNav = StackNavigationProp<AuthStackParamList, typeof ROUTES.AUTH>;

const AuthScreen = () => {
  const navigation = useNavigation<AuthNav>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, errorMessage } = useSelector((s: RootState) => s.auth);
  const displayError = error ?? errorMessage;
  const [signupRole, setSignupRole] = useState<RegisterRole>('ROLE_TENANT');

  useFocusEffect(
    useCallback(() => {
      dispatch(clearAuthError());
    }, [dispatch]),
  );

  const onGooglePress = () => {
    dispatch(userGoogleLogin({ role: signupRole }));
  };

  const goToEmailLogin = () => {
    dispatch(clearAuthError());
    navigation.navigate(ROUTES.LOGIN);
  };

  const isLandlord = signupRole === 'ROLE_LANDLORD';

  return (
    <AuthFormLayout>
      <BrandLogo size="lg" showBrandText style={styles.logo} />
      <Text style={formStyles.displayTitle}>CasaClick</Text>
      <Text style={formStyles.authSub}>Find your next home with confidence.</Text>

      {displayError ? <FormFlash message={displayError} variant="error" /> : null}

      <AuthButtonStack gap={SPACING.md}>
        <CustomButton
          variant="primary"
          label="Continue with email"
          onPress={goToEmailLogin}
          disabled={isLoading}
        />
      </AuthButtonStack>

      <FormDivider label="or" />

      <AccountRolePicker value={signupRole} onChange={setSignupRole} disabled={isLoading} />

      <AuthButtonStack>
        <CustomButton
          variant="google"
          label="Continue with Google"
          icon={<GoogleMark size={20} />}
          onPress={onGooglePress}
          disabled={isLoading}
          loading={isLoading}
        />
      </AuthButtonStack>

      <Text style={formStyles.hintText}>
        {isLandlord
          ? 'Landlords get listing tools after sign-in. Existing accounts keep their role.'
          : 'Tenants can browse and book after sign-in. No separate registration for Google.'}
      </Text>

      <View style={formStyles.authFooter}>
        <View style={formStyles.footerRow}>
          <Text style={formStyles.authFooterText}>Prefer email and password?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            disabled={isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={formStyles.link}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.legal}>
        By continuing, you agree to our terms of use and privacy practices.
      </Text>
    </AuthFormLayout>
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  legal: {
    ...FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
    fontSize: 12,
  },
});

export default AuthScreen;
