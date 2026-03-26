import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LogoutButton = ({ onLogout, label = 'Sign out' }) => {
  const handlePress = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    minWidth: 140,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
});

export default LogoutButton;
