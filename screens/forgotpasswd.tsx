import * as React from 'react';
import { Text, View } from 'react-native';
import ForgotPasswd from '../components/ForgotPasswd';
import { styles } from '../styles/css';

interface PropsType {
  navigation: any
}

function ForgotPasswdScreen({ navigation }: PropsType) {
    return (
      <View style={styles.container}>
          <ForgotPasswd navigation={navigation} />
      </View>
    );
}
  
export default ForgotPasswdScreen;