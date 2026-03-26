import { Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({ containerStyle, textStyle, label, onPress }) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity style={{ margin: 10 }} onPress={onPress}>
        <View style={{ padding: 10, backgroundColor: 'blue', borderRadius: 5 }}>
          <Text style={[textStyle, { color: 'white', fontSize: 20 }]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;

