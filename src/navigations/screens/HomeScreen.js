import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import CustomButton from '../../components/CustomButton';
import LogoutButton from '../../components/LogoutButton';
import CustomCard from '../../components/CustomCard';
import { USER_LOGIN_RESET } from '../../app/action';
import { COLORS, IMG, ROUTES } from '../../utils';


const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={IMG.CASACLICK} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>A cozy home in just one click</Text>

        <CustomCard label="Welcome to the Home Screen!" />

        <CustomButton
          label="Go to profile"
          onPress={() => {
            navigation.navigate(ROUTES.PROFILE);
          }}
        />
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
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
  },
});

export default HomeScreen;

