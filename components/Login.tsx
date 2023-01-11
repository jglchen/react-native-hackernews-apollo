import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator, Colors } from 'react-native-paper';
import { useMutation, gql } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { AUTH_TOKEN } from '../lib/constants';
import * as SecureStore from 'expo-secure-store';
import {UserContext} from './Context';
import { styles } from '../styles/css';

const SIGNUP_MUTATION = gql`
  mutation SignupMutation(
    $email: String!
    $password: String!
    $name: String!
  ) {
    signup(
      email: $email
      password: $password
      name: $name
    ) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation(
    $email: String!
    $password: String!
  ) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

interface PropsType {
  navigation: any;
}

const Login = ({ navigation }: PropsType) => {
    const userContext = useContext(UserContext);
    
    const [formState, setFormState] = useState({
      login: true,
      email: '',
      password: '',
      name: ''
    });
    const [inputErr, setInputErr] = useState('');
    const [passwdInputStr, setPasswdInputStr] = useState('Please type password');
    const nameEl = useRef(null);
    const emailEl = useRef(null);
    const pwdEl = useRef(null);

    useFocusEffect(
      useCallback(() => {
        setFormState({
          login: true,
          email: '',
          password: '',
          name: ''
        });
        setInputErr('');
      }, [navigation])
    );
  
    const [login, {data: loginData, loading: loginLoading, error: loginError}] = useMutation(LOGIN_MUTATION, {
      variables: {
        email: formState.email,
        password: formState.password
      },
      onCompleted: async ({ login }) => {
        //await AsyncStorage.setItem(AUTH_TOKEN, login.token);
        await SecureStore.setItemAsync(AUTH_TOKEN, login.token);
        userContext.login(login.token);
        navigation.navigate('New');
        //Keyboard.dismiss();

      },
      onError: (err) => {
        //Keyboard.dismiss();
        //console.log(err);
      }
    });
    
    const [signup, {data: signupData, loading: signupLoading, error: signupError}] = useMutation(SIGNUP_MUTATION, {
      variables: {
        name: formState.name,
        email: formState.email,
        password: formState.password
      },
      onCompleted: async ({ signup }) => {
        //await AsyncStorage.setItem(AUTH_TOKEN, signup.token);
        await SecureStore.setItemAsync(AUTH_TOKEN, signup.token);
        userContext.login(signup.token);
        navigation.navigate('New');
      },
      onError: (err) => {

        //console.log(err);
      }
    });

    useEffect(() => {
      async function appInit(){
        //const token = await AsyncStorage.getItem(AUTH_TOKEN);
        const token = await SecureStore.getItemAsync(AUTH_TOKEN);
        if (token){
           userContext.login(token);
        }
      }
      appInit();
    }, []); 
    
    useEffect(() => {
      if (formState.login){
        setPasswdInputStr('Please type password');
      }else{
        setPasswdInputStr('Choose a safe password');
      }
    },[formState.login]);

    return (
      <KeyboardAvoidingView
         style={{flex: 1}}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         >
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps='handled'
          >
          <View style={{flexDirection: 'row', justifyContent: 'center', paddingBottom: 10}}>
            <Text style={{fontWeight: 'bold', fontSize: 22}}>{formState.login ? 'Please Login' : 'Please Sign Up'}</Text>
          </View>
          {!formState.login && 
            <TextInput
              style={styles.input}
              onChangeText={(val) => {
                setInputErr('');
                setFormState({
                  ...formState,
                  name: val
                });
              }}
              value={formState.name}
              placeholder="Your name"
              ref={nameEl}
            />
          }
          <TextInput
            style={styles.input}
            onChangeText={(val) => {
              setInputErr('');
              setFormState({
                ...formState,
                email: val
              });
            }}
            value={formState.email}
            placeholder="Your email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            ref={emailEl}
          />
          <TextInput
            style={styles.input}
            onChangeText={(val) =>  {
              setInputErr('');
              setFormState({
                ...formState,
                password: val
              });
            }}
            value={formState.password}
            placeholder={passwdInputStr}
            secureTextEntry={true}
            ref={pwdEl}
          />
          {formState.login && 
          <>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Button
              mode='text'
              onPress={() => { navigation.navigate('ForgotPasswd') }}
              >forgot password?</Button>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              mode='contained'
              onPress={() => {
                setInputErr('');
                if (!formState.email){
                  setInputErr('Please enter your email address');
                  (emailEl.current as any).focus();
                  return;
                }
                if (!formState.password){
                  setInputErr('Please enter your password');
                  (pwdEl.current as any).focus();
                  return;
                }
                login();
              }}
              >login</Button>
          
            <Button
              mode='outlined'
              onPress={() => {
                setInputErr('');
                setFormState({
                  ...formState,
                  login: false
                });
              }}
              >create an account?</Button>
          </View>
          <View><Text style={{color: 'red', fontSize: 18}}>{inputErr}</Text></View>
          <View><Text style={{color: 'red', fontSize: 18}}>{loginError && loginError.message}</Text></View>
          </>
          }
          {!formState.login && 
          <>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Button
              mode='text'
              onPress={() => { navigation.navigate('ForgotPasswd') }}
              >forgot password?</Button>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              mode='contained'              
              onPress={() => {
                setInputErr('');
                if (!formState.name){
                  setInputErr('Please enter your name');
                  (nameEl.current as any).focus();
                  return;
               }
               if (!formState.email){
                  setInputErr('Please enter your email address');
                  (emailEl.current as any).focus();
                  return;
               }
               if (!formState.password){
                  setInputErr('Please enter your password');
                  (pwdEl.current as any).focus();
                  return;
               }
               signup(); 
                  
              }}
            >create account</Button>
            
            <Button
              mode='outlined'  
              onPress={() => {
                setInputErr('');
                setFormState({
                  ...formState,
                  login: true
                });
              }}
              >have an account?</Button>
          </View>
          <View><Text style={{color: 'red', fontSize: 18}}>{inputErr}</Text></View>
          <View><Text style={{color: 'red', fontSize: 18}}>{signupError && signupError.message}</Text></View>
          </>
          }
        </ScrollView>
        {(loginLoading || signupLoading) &&
          <View style={styles.loading}>
            <ActivityIndicator size="large" animating={true} color={Colors.white} />
          </View>
        }
      </KeyboardAvoidingView>
    );
};

export default Login;