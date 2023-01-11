import * as React from 'react';
import { useContext } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Text, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import jwt_decode from 'jwt-decode';
import {UserContext} from './Context';
import { timeDifferenceForDate } from '../lib/utils';
import { UserJwtPayload, Vote, LinkProps } from '../lib/types';

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

function getUserId(token: string) {
   if (!token){
      return null;   
   }
   const { userId } =  jwt_decode(token) as UserJwtPayload;
   return userId;
}

function isVoteCapable(token: string, votes: Vote[]){
   const userId = getUserId(token);
   if (!userId){
      return false;
   }
   
   const vote = votes.find((item) => 
       item.user.id == userId
   );
   if (vote){
      return false;
   }else{
     return true;
   }
}

const Link = ({ link, index} : LinkProps) => {
   const userContext = useContext(UserContext);
   const authToken = userContext.authToken;
   const linkUrl = link.url.trim();
   
   const [vote, {data, error}] = useMutation(VOTE_MUTATION, {
      variables: {
        linkId: link.id
      },
      /*
      update: (cache, {data: {vote}}) => {
        const { feed } = cache.readQuery({
          query: FEED_QUERY,
          variables: {
            take,
            skip,
            orderBy
          }
        });
    
        const updatedLinks = feed.links.map((feedLink) => {
          if (feedLink.id === link.id) {
            return {
              ...feedLink,
              votes: [...feedLink.votes, vote]
            };
          }
          return feedLink;
        });
    
        cache.writeQuery({
          query: FEED_QUERY,
          data: {
            feed: Object.assign({}, feed, {
              links: updatedLinks
            })
          },
          variables: {
            take,
            skip,
            orderBy
          }
        });
      },
      */
      onError: (err) => {
        //console.log(err);
      }
   });
   
   return (
       <View style={[styles.linkView, {flexDirection: 'row'}]}>
         <View>
            <Text style={styles.linkText}>{index+1}.{' '}
            {isVoteCapable(authToken!, link.votes!) && (
            <Text onPress={() => {vote();}}>▲{' '}</Text>
            )}</Text>
         </View>  
         <View style={{flexDirection: 'column'}}>
           <View>
               <Text style={styles.linkText}>{link.description}{'  '}(
                   <Text onPress={async () => {
                     try {
                        await Linking.openURL(linkUrl.toLowerCase().startsWith('http') ? linkUrl: 'https://' + linkUrl);
                     }catch(error){
                        console.log(error);
                     }
                     }}>
                    {linkUrl}
                   </Text>)
               </Text>
           </View>
           <View>
               <Text style={[styles.linkText,{color: 'gray'}]}>
               {link.votes?.length} votes | by{' '} 
               {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
               {timeDifferenceForDate(link.createdAt as string)}
               </Text>
           </View>
        </View>   
       </View>
   )   
};

const styles = StyleSheet.create({
    linkView: {
       paddingBottom: 5,  
    },
    linkText: {
       fontSize: 18,
    },
});

export default Link;