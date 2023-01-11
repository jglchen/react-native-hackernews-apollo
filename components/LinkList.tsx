import * as React from 'react';
import { useEffect } from 'react';
import db from '../lib/firestore';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ScrollView, ActivityIndicator, Button, Text, View, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Link from './Link';
import { useQuery, gql } from '@apollo/client';
import client from '../lib/apllo-client';
import { LINKS_PER_PAGE, TEMP_TOKEN } from '../lib/constants';
import {FeedData, LinkType, LinkDataType, FeedQueryParms, Vote, VoteDataType } from '../lib/types';
import { PUBLIC_CODE } from '@env';

export const FEED_QUERY = gql`
  query FeedQuery(
    $take: Int
    $skip: Int
    $orderBy: LinkOrderByInput
  ) {
    feed(take: $take, skip: $skip, orderBy: $orderBy) {
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
`;

const getQueryVariables = (isNewPage: boolean, page: number) => {
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
  const take = isNewPage ? LINKS_PER_PAGE : 100;
  const orderBy = { createdAt: 'desc' };
  return { take, skip, orderBy };
};

const getLinksToRender = (isNewPage: boolean, data: FeedData) => {
  if (isNewPage) {
    return data.feed.links;
  }
  const rankedLinks = data.feed.links.slice();
  rankedLinks.sort(
    (l1, l2) => (l2.votes?.length || 0) - (l1.votes?.length || 0)
  );
  return rankedLinks;
};

const LinkList = (props: any) => {
  const navigation = props.navigation;
  const isNewPage = props.isnewpage ? props.isnewpage: false;
  const page = props.page ? props.page: 0;
  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE : 0;
  
  const {
    data,
    loading,
    error,
  } = useQuery(FEED_QUERY, {
    variables: getQueryVariables(isNewPage, page),
  });
  
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
      const q = query(collection(db, "graphql", "hackernews", "recent"), where("key", "==", "newlink"), where("publiccode", "==", PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const docItem = doc.data() as LinkDataType;
          delete docItem.publiccode;
          delete docItem.key;
          feedCacheUpdate(docItem);
        });  
      });
  
      return () => {
        unsubscribe();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);
  
  useEffect(() => {
    if (data){
      const q = query(collection(db, "graphql", "hackernews", "recent"), where("key", "==", "newvote"), where("publiccode", "==", PUBLIC_CODE));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const docItem = doc.data() as VoteDataType;
          delete docItem.publiccode;
          //delete docItem.createdAt;
          delete docItem.key;
          voteCacheUpdate(docItem);
        });
      });
  
      return () => {
        unsubscribe();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);
  
  async function feedCacheUpdate(newLink: LinkDataType) {
    let link = await getLinkObject(newLink);
    const feedParams = [
       { take: 5, skip: 0, orderBy: { createdAt: 'desc' } },
       { take: 100, skip: 0, orderBy: { createdAt: 'desc' } }
    ];

    feedCacheUpdateProcess(link, feedParams[1], false);
    
    let continueOp = true;
    let param = feedParams[0];
    while (continueOp){
      const result = feedCacheUpdateProcess(link, param, continueOp);
      continueOp = result ? result.continueOp && result.link: false;
      link = result?.link;
      if (result?.param){ 
        param = result?.param;
      }
    }
    
 }

 async function getLinkObject(newLink: LinkDataType){
   const { postedById }  = newLink;
   let userData = client.readFragment({
      id: `User:${postedById}`,
      fragment: gql`
         fragment MyUser on User {
           id
           name
         }
      `,   
    });
    if (!userData){
       const { data } = await client.query({
        query: gql`
          query ReadUser($id: ID!) {
            user(id: $id) {
              id
              name
            }
          }
        `,
        variables: {
          id: postedById
        },
       });
       userData = data.user;
    }
    
    delete newLink.postedById;
    const returnLink: LinkType = {...newLink, postedBy: userData, __typename: 'Link', votes: newLink.votes || []};
    return returnLink;
    
    /*
    newLink.postedBy = userData;
    newLink.__typename = 'Link';
    newLink.createdAt = new Date(newLink.createdAt).toISOString();
    newLink.votes = [];
    delete newLink.postedById;

    return newLink;
    */
 }

 function feedCacheUpdateProcess(link: LinkType, param: FeedQueryParms, continueOp: boolean) {
    try {
       const {feed} = client.readQuery({
          query: FEED_QUERY,
          variables: param
       }); 
       const exists = (feed.links as LinkType[]).find(
         ({ id }) => id === link.id
       );
       if (exists){
          return;
       }
       if (feed.links.length < param.take || param.take !== 5){
         continueOp = false;
       }
       let newLinks;
       let forwardLink;
       if (continueOp){
          newLinks = [link, ...feed.links].slice(0, param.take);
          forwardLink = feed.links[param.take-1];
       }else{
         newLinks = [link, ...feed.links].slice();
       }
       
       client.writeQuery({
         query: FEED_QUERY,
         data: {
           feed: Object.assign({}, feed, 
           {
             links: newLinks,
             count: newLinks.length
           }),
         },
         variables: param
       });

       const nextParam = {take: param.take, skip: (param.skip + param.take), orderBy: { createdAt: 'desc' }};
       return {link: forwardLink, param: nextParam, continueOp};

    }catch(err){

    }
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
  
return (
    <ScrollView style={styles.scrollView}>
      {loading && <ActivityIndicator size="large" color="#00ff00" />}
      {error &&
          <View>
            <Text>{JSON.stringify(error, null, 2)}</Text>
          </View>
      }
      {data && (
         <>
          {getLinksToRender(isNewPage, data).map(
            (link, index) => (
              <Link
                key={link.id}
                link={link}
                index={index + pageIndex}
              />
            )
          )}
          {isNewPage && (
             <View style={{flexDirection: 'row', justifyContent: 'space-around',}}>
               {(page > 1) && (
                 <Button 
                   title="Previous"
                   onPress={() => navigation.navigate('New', {page: (page-1)})}
                 />
               )}
               {(1 <= data.feed.links.length / LINKS_PER_PAGE) && (
                 <Button 
                   title="Next"
                   onPress={() => navigation.navigate('New', {page: (page+1)})}
                 />
               )}
             </View>
          )}
         </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 10,
  },
});
  
export default LinkList;
  