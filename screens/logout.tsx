import * as React from 'react';
import { useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN } from '../lib/constants';
import {UserContext} from '../components/Context';

interface PropsType {
  navigation: any
}

function LogoutScreen({ navigation }: PropsType) {
  const userContext = useContext(UserContext);

  useFocusEffect(
    useCallback(() => {
      async function removeData() {
        await SecureStore.deleteItemAsync(AUTH_TOKEN);
        userContext.logout();
        navigation.navigate('New');
      }
  
      removeData();
    }, [navigation])
  );

  return (
      <View style={{padding: 10}}>
          <Text>Logout</Text>
      </View>
    );
}
  
export default LogoutScreen;