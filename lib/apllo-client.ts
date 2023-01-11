import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    split
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { AUTH_TOKEN, TEMP_TOKEN } from './constants';
import * as SecureStore from 'expo-secure-store';

const authLink = setContext(async(_, { headers }) => {
    //const token = await AsyncStorage.getItem(AUTH_TOKEN);
    const token = (await SecureStore.getItemAsync(AUTH_TOKEN)) || (await SecureStore.getItemAsync(TEMP_TOKEN));
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    };
});

const httpLink = createHttpLink({
    uri: 'https://hackernews-nextjs-apollo.vercel.app/api/graphql'
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;

  