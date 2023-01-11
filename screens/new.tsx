import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import LinkList from '../components/LinkList';

interface PropsType {
  route: any;
  navigation: any;
}

function NewScreen({ route, navigation }: PropsType) {
    let page = 1;
    if (route.params){
       page = route.params.page;
    }
    return (
      <View style={styles.container}>
        <LinkList navigation={navigation} page={page} isnewpage={true} />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10
  },
});
  
export default NewScreen;