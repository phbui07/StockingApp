import React, {useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {passwordHiddenIcon} from '../assets/svgXML';
import {vw} from '../services/styleSheet';
import {SignUpInputFieldProps} from '../services/typeProps';

// Rounded input used by the login and sign-up forms; `secure` fields get a
// show/hide toggle.
const InputField: React.FC<
  SignUpInputFieldProps & {email?: boolean; testID?: string}
> = ({onChangeText, placeholder, value, secure, email, testID}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={'#76787E'}
        style={styles.inputField}
        secureTextEntry={secure && !isPasswordVisible}
        autoCapitalize={secure || email ? 'none' : 'words'}
        autoCorrect={false}
        keyboardType={email ? 'email-address' : 'default'}
      />
      {secure && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconButton}>
          {passwordHiddenIcon(vw(6), vw(6))}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    paddingHorizontal: vw(3),
    paddingVertical: vw(3),
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'absolute',
    right: vw(3),
  },
});
