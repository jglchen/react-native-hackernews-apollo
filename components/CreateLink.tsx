import React, { useState, useRef, useCallback } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, Text, Keyboard } from "react-native";
import { Button, ActivityIndicator, Colors } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, gql } from '@apollo/client';
import { styles } from '../styles/css';

const CREATE_LINK_MUTATION = gql`
  mutation PostMutation(
    $description: String!
    $url: String!
  ) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

interface PropsType {
  navigation: any
}

const CreateLink = ({ navigation }: PropsType) => {
  const [formState, setFormState] = useState({
    description: '',
    url: ''
  }); 
  const [inputErr, setInputErr] = useState('');
  const descriptionEl = useRef(null);
  const urlEl = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setFormState({
        description: '',
        url: ''
      });
      setInputErr('');
    }, [navigation])
  );
  
  const [createLink, {data: createData, loading: createLoading, error: createError}] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url
    },
    onCompleted: () => {
      setFormState({
        description: '',
        url: ''      
      });
      navigation.navigate('New');
    },
    onError: (err) => {
      //console.log(err);
    }
   });  

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps='handled'
        >
        <TextInput
          style={styles.input}
          onChangeText={(val) =>  {
            setInputErr('');
            setFormState({
              ...formState,
              description: val
            });
          }}
          value={formState.description}
          placeholder="A description for the link"
          ref={descriptionEl}
        />
        <TextInput
          style={styles.input}
          onChangeText={(val) =>  {
            setInputErr('');
            setFormState({
              ...formState,
              url: val
            });
          }}
          value={formState.url}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="The URL for the link"
          ref={urlEl}
        />
        <Button
          mode='contained' 
          onPress={() => {
            setInputErr('');
            if (!formState.description){
               setInputErr('Please enter description');
               (descriptionEl.current as any).focus();
               return;
            }
            if (!formState.url){
              setInputErr('Please enter url');
              (urlEl.current as any).focus();
              return;
            }
            createLink();
          }}
        >Submit</Button>
        <View><Text style={{color: 'red', fontSize: 18}}>{inputErr}</Text></View>
        <View><Text style={{color: 'red', fontSize: 18}}>{createError && createError.message}</Text></View>
      </ScrollView>
      {createLoading &&
          <View style={styles.loading}>
            <ActivityIndicator size="large" animating={true} color={Colors.white} />
          </View>
      }
    </KeyboardAvoidingView>
  );
};

export default CreateLink;