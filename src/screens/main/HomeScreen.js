import { Image, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import LogoutButton from '../../components/LogoutButton';
import { USER_LOGIN_RESET } from '../../app/action';
import { COLORS, IMG } from '../../utils';

const HomeScreen = () => {
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={IMG.CASACLICK} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>A cozy home in just one click</Text>
      </View>
      <View style={styles.footer}>
        <LogoutButton onLogout={() => dispatch({ type: USER_LOGIN_RESET })} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
  },
});

export default HomeScreen;

