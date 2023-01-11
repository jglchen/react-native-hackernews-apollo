import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import { useState, useEffect } from 'react';
import client from './lib/apllo-client';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserContext } from './components/Context';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN } from './lib/constants';
import AppNavigator from './AppNavigator';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');

  const login = (token?: string) => {
    if (token){
      setLoggedIn(true);
      setAuthToken(token);
    }
  };
 
  const logout = () => {
    setLoggedIn(false);
    setAuthToken('');
  };

  const userContext = {
    isLoggedIn: loggedIn, 
    authToken: authToken, 
    login: login, 
    logout: logout
  }

  useEffect(() => {
    async function initApp(){
      const token = await SecureStore.getItemAsync(AUTH_TOKEN);
      if (token){
         setLoggedIn(true);
         setAuthToken(token);
      }
    }
    initApp();
  }, []);    
  
  return (
    <ApolloProvider client={client}>
        <UserContext.Provider value={userContext}>
          <AppNavigator />
       </UserContext.Provider>
   </ApolloProvider>
  );
}

/*
import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apllo-client';
import { AuthProvider} from './components/Context';
import AppNavigator from './AppNavigator';

export default function App() {
  return (
    <ApolloProvider client={client}>
       <AuthProvider>
         <AppNavigator />
       </AuthProvider>
    </ApolloProvider>
   );
}
*/

/*
import * as React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import NewScreen from './screens/new';

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'ios-information-circle'
                : 'ios-information-circle-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'ios-list-circle' : 'ios-list';
            } else if (route.name === 'New') {
              iconName = focused ? 'ios-logo-hackernews' : 'ios-logo-hackernews';
            }  

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          //tabBarActiveTintColor: 'tomato',
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="New" component={NewScreen} options={{ headerTitle: 'Hacker News' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
*/
