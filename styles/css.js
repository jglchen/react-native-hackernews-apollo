import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10
    },
    scrollView: {
      marginHorizontal: 10,
    },
    input: {
      height: 40,
      marginBottom: 10,
      borderColor: 'grey',
      borderWidth: 1,
      borderRadius: 4,
      padding: 10,
      fontSize: 18,
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.5,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center'
    },
});
