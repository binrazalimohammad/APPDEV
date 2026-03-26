import { Alert, StyleSheet, Text, View } from 'react-native';
import CustomButton from './CustomButton';

const CustomCard = ({ label }) => {
  return (
    <View
      style={{
        backgroundColor: '#e7cd78',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      <Text style={styles.cardTitle}>{label}</Text>
      <CustomButton
        label="pindota"
        onPress={() => {
          Alert.alert('Hello, World!');
          Alert.alert('Hello, ahahhahaha!');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default CustomCard;
