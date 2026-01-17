/**
 * Private Chat Dating Application
 * 
 * Main entry point for the application
 * 
 * Architecture:
 * - Clean architecture with separation of concerns
 * - Domain layer: entities, repositories, use cases
 * - Data layer: repository implementations
 * - Presentation layer: UI components and screens
 * 
 * Key Features:
 * - Infinite message history with pagination
 * - Progressive content reveal
 * - Book-like, intimate UX
 * - Private 1-to-1 conversations
 */

import React from 'react';
import { AppNavigation } from './src/presentation/navigation/AppNavigation';
import 'react-native-gesture-handler';

function App(): React.JSX.Element {
  return <AppNavigation />;
}

export default App;
