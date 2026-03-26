import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import LogoutButton from '../../components/LogoutButton';
import { USER_LOGIN_RESET } from '../../app/action';
import { COLORS } from '../../utils';

const ProfileScreen = () => {
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account</Text>
      <View style={styles.logoutSection}>
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
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  logoutSection: {
    marginTop: 24,
  },
});

export default ProfileScreen;

