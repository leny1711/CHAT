import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>CHAT</Text>
        <Text style={styles.subtitle}>
          Private conversations built for calm, real connection.
        </Text>
        <Text style={styles.helper}>
          Start Metro with
          {'\n'}
          <Text style={styles.code}>npx react-native start</Text>
          {'\n'}
          then launch on Android with
          {'\n'}
          <Text style={styles.code}>npx react-native run-android</Text>
          {'\n'}
          or on iOS with
          {'\n'}
          <Text style={styles.code}>npx react-native run-ios</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#3C2F2F',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#4E3D3D',
    textAlign: 'center',
    lineHeight: 22,
  },
  helper: {
    marginTop: 20,
    fontSize: 14,
    color: '#6A5F5F',
    textAlign: 'center',
    lineHeight: 20,
  },
  code: {
    fontWeight: '700',
    color: '#2F4550',
  },
});

export default App;
