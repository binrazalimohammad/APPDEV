import { Text, TextInput, View } from 'react-native';

const CustomTextInput = ({
  placeholder,
  label,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry,
}) => {
  return (
    <View style={containerStyle}>
      <Text>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[
          textStyle,
          {
            borderBottomWidth: 1,
            borderColor: 'black',
            width: '100%',
          },
        ]}
      />
    </View>
  );
};

export default CustomTextInput;

