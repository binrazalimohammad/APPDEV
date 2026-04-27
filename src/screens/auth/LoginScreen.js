import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../app/reducers/auth';
import { USER_LOGIN_COMPLETED } from '../../app/action';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { IMG } from '../../utils';

const LoginScreen = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(s => s.auth);

  const handleLogin = () => {
    if (emailAdd.trim() === '' || password.trim() === '') {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }
    if (emailAdd === '123' && password === '123') {
      dispatch({ type: USER_LOGIN_COMPLETED, payload: { token: 'demo', user: null } });
      return;
    }
    dispatch(userLogin({ email: emailAdd, password }));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Image source={IMG.CASACLICK} style={styles.logo} resizeMode="contain" />
      {error ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
      ) : null}
      <CustomTextInput
        label="Email Address"
        placeholder={'Enter your email'}
        value={emailAdd}
        onChangeText={setEmailAdd}
        containerStyle={{
          padding: 10,
          width: '80%',
        }}
        textStyle={{
          fontSize: 20,
        }}
      />

      <CustomTextInput
        label={'Password'}
        placeholder={'Enter your password'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={{
          padding: 10,
          width: '80%',
        }}
        textStyle={{
          fontSize: 20,
        }}
      />

      <CustomButton
        label={'Login'}
        containerStyle={{
          borderWidth: 2,
          width: '80%',
        }}
        textStyle={{
          textAlign: 'center',
        }}
        onPress={handleLogin}
        disabled={isLoading}
      />
      {isLoading ? <ActivityIndicator size="large" style={{ marginTop: 16 }} /> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
});

export default LoginScreen;

