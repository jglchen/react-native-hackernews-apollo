import * as React from 'react';
import { Text, View } from 'react-native';
import Login from '../components/Login';
import { styles } from '../styles/css';

interface PropsType {
  navigation: any
}

function LoginScreen({ navigation }: PropsType) {
    return (
      <View style={styles.container}>
          <Login navigation={navigation} />
      </View>
    );
}
  
export default LoginScreen;