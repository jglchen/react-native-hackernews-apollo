import * as React from 'react';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { UserContext } from './components/Context';
import NewScreen from './screens/new';
import TopScreen from './screens/top';
import SearchScreen from './screens/search';
import SubmitScreen from './screens/submit';
import AboutScreen from './screens/about';
import LoginScreen from './screens/login';
import ForgotPasswdScreen from './screens/forgotpasswd';
import LogoutScreen from './screens/logout';


export default function AppNavigator() {
    const userContext = useContext(UserContext);
    const isLoggedIn = userContext.isLoggedIn;

    const Stack = createStackNavigator();
    const Tab = createBottomTabNavigator();

    function LoginStack() {
      return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}  
          >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            />
          <Stack.Screen 
            name="ForgotPasswd" 
            component={ForgotPasswdScreen} 
            />
        </Stack.Navigator>
      ); 
    }

    return (
    <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ff5733',
            },
            headerTintColor: '#fff',
            tabBarActiveTintColor: '#ff5733',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen name="New" 
              component={NewScreen} 
              options={{ headerTitle: 'Hacker News Clone',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'ios-logo-hackernews' : 'ios-logo-hackernews';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          <Tab.Screen name="Top" 
              component={TopScreen} 
              options={{ headerTitle: 'Top News',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'arrow-down-circle' : 'arrow-down-circle-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          <Tab.Screen name="Search" 
              component={SearchScreen} 
              options={{ headerTitle: 'Search News',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'search' : 'search-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          {isLoggedIn && 
            <Tab.Screen name="Submit" 
              component={SubmitScreen} 
              options={{ headerTitle: 'Submit News',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'create' : 'create-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          }
          <Tab.Screen name="About" 
              component={AboutScreen} 
              options={{ headerTitle: 'About Hacker News Clone',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'md-information-circle' : 'md-information-circle-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          {isLoggedIn &&
            <Tab.Screen name="Logout" 
              component={LogoutScreen} 
              options={{ headerTitle: 'Logout', tabBarLabel: 'Logout',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'log-out' : 'log-out-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          }
          {!isLoggedIn &&
            <Tab.Screen name="LoginStack" 
              component={LoginStack} 
              options={{ headerTitle: 'Login Hacker News Clone', tabBarLabel: 'Login',
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = focused ? 'log-in' : 'log-in-outline';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              }} />
          }
        </Tab.Navigator>
    </NavigationContainer>
    );
}    