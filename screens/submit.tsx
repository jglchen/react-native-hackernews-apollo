import * as React from 'react';
import { Text, View } from 'react-native';
import CreateLink from '../components/CreateLink';
import { styles } from '../styles/css';

interface PropsType {
  navigation: any
}

function SubmitScreen({ navigation }: PropsType) {
    return (
      <View style={styles.container}>
        <CreateLink navigation={navigation} />
      </View>
    );
}
  
export default SubmitScreen;