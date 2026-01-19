/**
 * Clean React Native CLI Application
 * 
 * A minimal, stable foundation for Android mobile development.
 * No navigation, no animations, no external dependencies.
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, {color: textColor}]}>
            Welcome to React Native
          </Text>
          <Text style={[styles.subtitle, {color: textColor}]}>
            Clean Foundation
          </Text>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              ✓ React Native CLI
            </Text>
            <Text style={[styles.sectionDescription, {color: textColor}]}>
              Stable, minimal setup without external dependencies
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              ✓ Android Build
            </Text>
            <Text style={[styles.sectionDescription, {color: textColor}]}>
              Successfully builds and runs on real devices
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              ✓ Ready for Development
            </Text>
            <Text style={[styles.sectionDescription, {color: textColor}]}>
              Add features incrementally as needed
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
  },
});

export default App;
