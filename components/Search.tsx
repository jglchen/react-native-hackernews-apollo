//firestore does not support full-text search. We have to set up third party search service 
//like Algolia(https://www.algolia.com/developers/firebase-search-extension/) to implement full
//text search. For this demonstration, we use an impractical solution in production as 
//downloading an entire collection to search for fields client-side.
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, Keyboard } from "react-native";
import { Button, ActivityIndicator, Colors } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import client from '../lib/apllo-client';
import db from '../lib/firestore';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from './Link';
import { TEMP_TOKEN } from '../lib/constants';
import {FeedData, VoteDataType, LinkType, FeedQueryParms, Vote } from '../lib/types';
import { styles } from '../styles/css';
import { PUBLIC_CODE } from '@env';

interface PropsType {
   navigation: any
}

const Search = ({ navigation }: PropsType) => {
   const [searchFilter, setSearchFilter] = useState('');
   const [searchResult, setSearchResult] = useState<LinkType[]>([]);
   const [data, setData] = useState<FeedData | null>(null);
   const [inLoading, setInLoading] = useState(false);

   useFocusEffect(
      useCallback(() => {
        setSearchFilter('');
        setSearchResult([]);
        setData(null);
      }, [navigation])
   );

   useEffect(() => {
      async function removeTempToken(){
        const tempToken = await SecureStore.getItemAsync(TEMP_TOKEN);
        if (tempToken){
          await SecureStore.deleteItemAsync(TEMP_TOKEN);
        }
      }
      removeTempToken();
   },[]);

   useEffect(() => {
      if (data){
        const q = query(collection(db, "graphql", "hackernews", "recent"), where("key", "==", "newvote"), where("publiccode", "==", PUBLIC_CODE));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const docItem = doc.data() as VoteDataType;
            delete docItem.publiccode;
            //delete docItem.createdAt;
            delete docItem.key;
            voteDataUpdate(docItem);
            voteSearchResultUpdate(docItem);
            voteCacheUpdate(docItem);
          });
        });
    
        return () => {
          unsubscribe();
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
   },[data, searchResult]);
   
   const voteDataUpdate = (newVote: VoteDataType) => {
      if (!data){
         return;
      }

      const { linkId, userId }  = newVote;
      const linkDataIndex = data.feed.links.findIndex(({id}) => id === linkId);
      if (linkDataIndex < 0){
         return;
      }
      const linkData =  data.feed.links[linkDataIndex];  
      const exists = linkData.votes?.find(
        ({ id }) => id === newVote.id
      );
      if (exists){
         return;
      }
    
      const voteData = {
         __typename: 'Vote', 
         id: newVote.id,
         user: {
            __typename: 'User',
            id: userId
         }
      };
      const newVotes = [...(linkData.votes || []), voteData];
      const newLink = {...linkData, votes: newVotes};
      const links = [];
      for (let link of data!.feed.links) {
         links.push(link);
      } 
      links[linkDataIndex] = newLink;
      const newFeed = {...data.feed, links: links};
      const newData = {...data, feed: newFeed};
      setData(newData);
   }
    
   const voteSearchResultUpdate = (newVote: VoteDataType) => {
      const { linkId, userId }  = newVote;
      const linkDataIndex = searchResult.findIndex(({id}) => id === linkId);
      if (linkDataIndex < 0){
         return;
      }
      const linkData =  searchResult[linkDataIndex];  
      const exists = linkData.votes?.find(
        ({ id }) => id === newVote.id
      );
      if (exists){
         return;
      }
    
      const voteData = {
         __typename: 'Vote', 
         id: newVote.id,
         user: {
            __typename: 'User',
            id: userId
         }
      };
      
      const newVotes = [...(linkData.votes || []), voteData];
      const newLink = {...linkData, votes: newVotes};
      const links = [];
      for (let link of searchResult) {
         links.push(link);
      } 
      links[linkDataIndex] = newLink;
      setSearchResult(links);
   }
   
   async function voteCacheUpdate(newVote: VoteDataType) {
      const { linkId, userId }  = newVote;
      const linkData = client.readFragment({
        id: `Link:${linkId}`,
        fragment: gql`
           fragment MyLink on Link {
              id
              votes {
                id
                user {
                  id
                }
              }
           }
        `,   
      });
      if (!linkData){
         return;
      }
      const exists = (linkData.votes as Vote[]).find(
        ({ id }) => id === newVote.id
      );
      if (exists){
         return;
      }
      
      const voteData = {
         __typename: 'Vote', 
         id: newVote.id,
         user: {
            id: userId
         }
      };
      
      client.writeFragment({
        id: `Link:${linkId}`,
        fragment: gql`
         fragment MyLink on Link {
            votes {
             id
             user {
               id
             }
           }
         }
        `,
        data: {
          votes: [...linkData.votes, voteData],
        },
      });
   }  
   
   async function sendQuery(){
      if (!searchFilter){
         setSearchResult([]); 
         return;
      }
      
      if (!data){
         setInLoading(true);
         try {
            const result = await client.query({
               query: gql`
                 query FeedQuery {
                   feed(take: 100, skip: 0, orderBy: {createdAt: desc}) {
                     id
                     links {
                       id
                       createdAt
                       url
                       description
                       postedBy {
                         id
                         name
                       }
                       votes {
                         id
                         user {
                           id
                         }
                       }
                     }
                     count
                   }
                 }
               `
            });
            //console.log(result);
            setData(result.data);

            const links = result.data.feed.links.filter((item: LinkType) => 
               item.url.includes(searchFilter) || item.description.includes(searchFilter)
            );
            setSearchResult(links);
         }catch(err){
            //.....
         }
         setInLoading(false);
         return;
      }

      const links = data.feed.links.filter((item) => 
         item.url.includes(searchFilter) || item.description.includes(searchFilter)
      );
      setSearchResult(links);
   }

   return (
      <KeyboardAvoidingView
         style={{flex: 1}}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         >
         <ScrollView 
            keyboardShouldPersistTaps='handled'
            style={styles.scrollView}>
            <TextInput
               style={styles.input}
               onChangeText={(val) =>  {
                  setSearchFilter(val);
                  setSearchResult([]);
               }}
               value={searchFilter}
               placeholder="Search"
            />
            <Button
               mode='contained'
               onPress={() => {sendQuery();Keyboard.dismiss();}}
               style={{marginBottom: 10}}
               >OK</Button>
            {searchResult.map((link, index) => (
               <Link key={link.id} link={link} index={index} />))
            }
         </ScrollView>
         {inLoading &&
          <View style={styles.loading}>
            <ActivityIndicator size="large" animating={true} color={Colors.white} />
          </View>
         }

      </KeyboardAvoidingView>
   );
};   

export default Search;
