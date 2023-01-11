import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator, Colors } from 'react-native-paper';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { AUTH_TOKEN, TEMP_TOKEN } from '../lib/constants';
import { PasswdCheck } from '../lib/types';
import * as SecureStore from 'expo-secure-store';
import {UserContext} from './Context';
import { styles } from '../styles/css';

const FORGOTPASSWD_QUERY = gql`
  query ForgotPasswdQuery(
    $email: String!
  ) {
    forgotpasswd(email: $email) {
      mail_sent
      numForCheck
      token
    }
  }
`;

const RESETPASSWD_MUTATION = gql`
  mutation resetPasswdMutation(
    $password: String!
  ) {
    resetpasswd(
      password: $password
    ) {
      id
    }
  }
`;

interface PropsType {
  navigation: any;
}

const ForgotPasswd = ({ navigation }: PropsType) => {
    const userContext = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [emailerr, setEmailErr] = useState('');
    const emailEl = useRef(null);
    const [checkdata, setCheckdata] = useState<PasswdCheck | null>(null);
    const [numForCheck, setNumForCheck] = useState('');
    const [numchkerr, setNumchkerr] = useState('');
    const numchkEl = useRef(null);
    const [passwd, setPasswd] = useState('');
    const [passwd2, setPasswd2] = useState('');
    const [passwderr, setPassWdErr] = useState('');
    const passwdEl = useRef(null);
    const passwd2El = useRef(null);
    
    useFocusEffect(
      useCallback(() => {
        setEmail('');
        setEmailErr('');
        setCheckdata(null);
        setNumForCheck('');
        setNumchkerr('');
        resetPasswdForm(); 
      }, [navigation])
    );
    
    const [executeForgotPasswd, { data: emailCheck, loading: checkLoading, error: checkError }] = useLazyQuery(
      FORGOTPASSWD_QUERY, {fetchPolicy: 'network-only'}
    );
  
    const [resetPasswd, {data: resetData, loading: resetLoading, error: resetError}] = useMutation(RESETPASSWD_MUTATION, {
      variables: {
        password: passwd
      },
      onCompleted: async ({ login }) => {
        await SecureStore.deleteItemAsync(TEMP_TOKEN);
        await SecureStore.setItemAsync(AUTH_TOKEN, checkdata?.token as string);
        resetPasswdForm();
        userContext.login(checkdata?.token);
        navigation.navigate('New');
      },
      onError: (err) => {
        //console.log(err);
      }
    });
  
    useEffect(() => {
      if (!emailCheck){
        return;
      }
  
      const {forgotpasswd} = emailCheck;
      if (!forgotpasswd.mail_sent){
        setEmailErr("Sorry, we can't find this account.");
        (emailEl.current as any).focus();
        return;
      }
      if (forgotpasswd.mail_sent){
        setEmailErr("Email for password reset has been already sent");
      }
      setCheckdata(forgotpasswd);
      setEmailErr('');
    },[emailCheck]);

    function handleEmailChange(text: string){
      const value = text.trim().replace(/<\/?[^>]*>/g, "");
      setEmail(value);
      setEmailErr('');
    }
  
    function handleNumberChk(text: string){
      const value = text.trim().replace(/<\/?[^>]*>/g, "");
      setNumForCheck(value);
      setNumchkerr('');
    }
  
    function submitNumberCheck(){
      setNumchkerr('');
      if (checkdata && numForCheck != checkdata.numForCheck){
         setNumchkerr('The number you typed is not matched to the figure in the email.');
         (numchkEl.current as any).focus();
         return;
      }
    }

    async function submitPasswdReset(){
      //Reset all the err messages
      setPassWdErr('');
  
      //Check if Passwd is filled
      if (!passwd || !passwd2){
         setPassWdErr("Please type your password, this field is required!");
         if (!passwd){
            (passwdEl.current as any).focus();
         }else{
            (passwd2El.current as any).focus();
         }
         return;
      }
      //Check the passwords typed in the two fields are matched
      if (passwd != passwd2){
         setPassWdErr("Please retype your passwords, the passwords you typed in the two fields are not matched!");
         (passwdEl.current as any).focus();
         return;
      }
  
      await SecureStore.setItemAsync(TEMP_TOKEN, checkdata?.token as string);
      resetPasswd();
    }
      
    function resetPasswdForm(){
      setPasswd('');
      setPasswd2('');
      setPassWdErr('');
    }

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
            <Text style={{fontWeight: 'bold', fontSize: 22}}>Forgot Password</Text>
          </View>
          {checkdata &&
          <>
          {numForCheck == checkdata.numForCheck &&
          <>
          <TextInput
            style={styles.input}
            onChangeText={(val) =>  setPasswd(val) }
            value={passwd}
            placeholder="Password"
            secureTextEntry={true}
            ref={passwdEl}
          />
          {numchkerr &&
          <View><Text style={{color: 'red', fontSize: 18}}>{passwderr}</Text></View>
          }
          {resetError?.message &&
          <View><Text style={{color: 'red', fontSize: 18}}>{resetError?.message}</Text></View>
          }
         <TextInput
            style={styles.input}
            onChangeText={(val) =>  setPasswd2(val) }
            value={passwd2}
            placeholder="Please type password again"
            secureTextEntry={true}
            ref={passwd2El}
          />
           <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              mode='contained'
              onPress={() => submitPasswdReset()}
              >Reset Password</Button>
            <Button
              mode='outlined'
              onPress={() => navigation.navigate('Login') }
              >Back To Login</Button>
          </View>
          </>
          }
          {numForCheck != checkdata.numForCheck &&
          <>
          <View><Text style={{fontSize: 18}}>Email for password reset has been already sent! Please check the email we sent to you, and type the number in the following.</Text></View>
          <TextInput
            style={styles.input}
            onChangeText={(val) => handleNumberChk(val)}
            value={numForCheck}
            placeholder="Please type the number you got in the email"
            keyboardType="numeric"
            ref={numchkEl}
          />
          {numchkerr &&
          <View><Text style={{color: 'red', fontSize: 18}}>{numchkerr}</Text></View>
          }
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              mode='contained'
              onPress={() => submitNumberCheck()}
              >Send Reset Email</Button>
          
            <Button
              mode='outlined'
              onPress={() => navigation.navigate('Login') }
              >Back To Login</Button>
          </View>
          </>
          }
          </>
          }
          {!checkdata &&
          <>
          <TextInput
            style={styles.input}
            onChangeText={(val) => handleEmailChange(val)}
            value={email}
            placeholder="Your email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            ref={emailEl}
          />
          {emailerr &&
          <View><Text style={{color: 'red', fontSize: 18}}>{emailerr}</Text></View>
          }
          {checkError?.message &&
          <View><Text style={{color: 'red', fontSize: 18}}>{checkError?.message}</Text></View>
          }
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              mode='contained'
              onPress={() => {
                setEmailErr('');
 
                executeForgotPasswd({
                  variables: { email }
                });
              }}
              >Send Reset Email</Button>
          
            <Button
              mode='outlined'
              onPress={() => navigation.navigate('Login') }
              >Back To Login</Button>
          </View>
          </>
          }

          {/*
          <View style={{flexDirection: 'row', justifyContent: 'center', paddingBottom: 10}}>
            <Text style={{fontWeight: 'bold', fontSize: 22}}>Forgot Password</Text>
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
              onPress={() => {
              }}
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
              onPress={() => {
              }}
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
            */}

        </ScrollView>
        {(checkLoading || resetLoading) &&
          <View style={styles.loading}>
            <ActivityIndicator size="large" animating={true} color={Colors.white} />
          </View>
        }
      </KeyboardAvoidingView>
    );
};

export default ForgotPasswd;