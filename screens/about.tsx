import * as React from 'react';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { TEMP_TOKEN } from '../lib/constants';

interface PropsType {
  navigation: any
}

function AboutScreen({ navigation }: PropsType) {
  useEffect(() => {
    async function removeTempToken(){
      const tempToken = await SecureStore.getItemAsync(TEMP_TOKEN);
      if (tempToken){
        await SecureStore.deleteItemAsync(TEMP_TOKEN);
      }
    }
    removeTempToken();
  },[]);

  return (
    <View style={{padding: 10}}>
      <Text style={{fontSize: 20, lineHeight: 32}}>
        This is a <Text style={{color: 'navy'}} onPress={async() => {await Linking.openURL('https://news.ycombinator.com/');}}>Hackernews</Text> mobile app built with react native implementing GraphQL APIs, which can be considered as the mobile version of <Text style={{color: 'navy'}} onPress={async() => {await Linking.openURL('https://hackernews-nextjs-apollo.vercel.app');}}>https://hackernews-nextjs-apollo.vercel.app</Text>.
      </Text>
    </View>
  );
}
  
export default AboutScreen;