import * as React from 'react';
import { View } from 'react-native';
import LinkList from '../components/LinkList';
import { styles } from '../styles/css';

interface PropsType {
  navigation: any
}

function TopScreen({ navigation }: PropsType) {
    return (
      <View style={styles.container}>
        <LinkList navigation={navigation} />
      </View>
    );
}

  
export default TopScreen;