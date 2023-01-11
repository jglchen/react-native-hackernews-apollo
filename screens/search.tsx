import * as React from 'react';
import { View } from 'react-native';
import Search from '../components/Search';
import { styles } from '../styles/css';

interface PropsType {
  navigation: any
}

function SearchScreen({ navigation }: PropsType) {
    return (
      <View style={styles.container}>
        <Search navigation={navigation} />
      </View>
    );
}
  
export default SearchScreen;