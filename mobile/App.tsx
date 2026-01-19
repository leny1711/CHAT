/**
 * Minimal Dating App Core
 *
 * Simple state-based navigation without external libraries
 * No animations, no complex navigation, just the essentials
 */

import React, {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View, Text} from 'react-native';

// Screens
import {LoginScreen} from './src/presentation/screens/LoginScreen';
import {RegisterScreen} from './src/presentation/screens/RegisterScreen';
import {SimpleDiscoveryScreen} from './src/presentation/screens/SimpleDiscoveryScreen';
import {MatchesScreen} from './src/presentation/screens/MatchesScreen';
import {ConversationScreen} from './src/presentation/screens/ConversationScreen';
import {SettingsScreen} from './src/presentation/screens/SettingsScreen';

// Repositories
import {InMemoryUserRepository} from './src/data/repositories/InMemoryUserRepository';
import {InMemoryMessageRepository} from './src/data/repositories/InMemoryMessageRepository';
import {InMemoryMatchRepository} from './src/data/repositories/InMemoryMatchRepository';

// Use cases
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
} from './src/domain/usecases/AuthUseCases';
import {
  GetMessagesUseCase,
  SendMessageUseCase,
  SubscribeToConversationUseCase,
} from './src/domain/usecases/MessageUseCases';
import {
  GetDiscoveryProfilesUseCase,
  LikeUserUseCase,
  PassUserUseCase,
  GetMatchesUseCase,
} from './src/domain/usecases/MatchUseCases';

import {User} from './src/domain/entities/User';
import {Match} from './src/domain/entities/Match';
import {theme} from './src/presentation/theme/theme';

// Initialize repositories
const userRepository = new InMemoryUserRepository();
const messageRepository = new InMemoryMessageRepository();
const matchRepository = new InMemoryMatchRepository();

// Initialize use cases
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);
const logoutUseCase = new LogoutUseCase(userRepository);

const getMessagesUseCase = new GetMessagesUseCase(messageRepository);
const sendMessageUseCase = new SendMessageUseCase(messageRepository);
const subscribeToConversationUseCase = new SubscribeToConversationUseCase(
  messageRepository,
);

const getDiscoveryProfilesUseCase = new GetDiscoveryProfilesUseCase(
  matchRepository,
);
const likeUserUseCase = new LikeUserUseCase(matchRepository);
const passUserUseCase = new PassUserUseCase(matchRepository);
const getMatchesUseCase = new GetMatchesUseCase(matchRepository);

type Screen =
  | 'Login'
  | 'Register'
  | 'Discovery'
  | 'Matches'
  | 'Profile'
  | 'Conversation';

interface ConversationParams {
  conversationId: string;
  matchId: string;
  otherUserName: string;
}

interface TabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// Simple tab bar for main screens
const TabBar: React.FC<TabBarProps> = ({currentScreen, onNavigate}) => (
  <View style={styles.tabBar}>
    <Text
      style={[
        styles.tabItem,
        currentScreen === 'Discovery' && styles.tabItemActive,
      ]}
      onPress={() => onNavigate('Discovery')}>
      Discovery
    </Text>
    <Text
      style={[
        styles.tabItem,
        currentScreen === 'Matches' && styles.tabItemActive,
      ]}
      onPress={() => onNavigate('Matches')}>
      Matches
    </Text>
    <Text
      style={[
        styles.tabItem,
        currentScreen === 'Profile' && styles.tabItemActive,
      ]}
      onPress={() => onNavigate('Profile')}>
      Profile
    </Text>
  </View>
);

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversationParams, setConversationParams] =
    useState<ConversationParams | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password);
    setCurrentUser(user);
    messageRepository.setCurrentUser(user.id);
    matchRepository.setCurrentUser(user.id);
    setCurrentScreen('Discovery');
  };

  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    bio: string,
  ) => {
    const user = await registerUseCase.execute(email, password, {name, bio});
    setCurrentUser(user);
    messageRepository.setCurrentUser(user.id);
    matchRepository.setCurrentUser(user.id);
    setCurrentScreen('Discovery');
  };

  const handleLogout = async () => {
    await logoutUseCase.execute();
    setCurrentUser(null);
    messageRepository.setCurrentUser(null);
    matchRepository.setCurrentUser(null);
    setCurrentScreen('Login');
  };

  const handleSelectMatch = (match: Match) => {
    setConversationParams({
      conversationId: match.conversationId,
      matchId: match.id,
      otherUserName: `Match #${match.id.slice(-6)}`,
    });
    setCurrentScreen('Conversation');
  };

  const renderScreen = () => {
    if (!currentUser) {
      if (currentScreen === 'Register') {
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentScreen('Login')}
          />
        );
      }
      return (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('Register')}
        />
      );
    }

    // Authenticated screens
    switch (currentScreen) {
      case 'Discovery':
        return (
          <>
            <SimpleDiscoveryScreen
              onLike={async userId => {
                await likeUserUseCase.execute(userId);
              }}
              onPass={async userId => {
                await passUserUseCase.execute(userId);
              }}
              getProfiles={async () => {
                return getDiscoveryProfilesUseCase.execute();
              }}
            />
            <TabBar
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
            />
          </>
        );

      case 'Matches':
        return (
          <>
            <MatchesScreen
              onGetMatches={async () => {
                return getMatchesUseCase.execute();
              }}
              onSelectMatch={handleSelectMatch}
            />
            <TabBar
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
            />
          </>
        );

      case 'Profile':
        return (
          <>
            <SettingsScreen user={currentUser} onLogout={handleLogout} />
            <TabBar
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
            />
          </>
        );

      case 'Conversation':
        if (!conversationParams) {
          setCurrentScreen('Matches');
          return null;
        }
        return (
          <ConversationScreen
            conversationId={conversationParams.conversationId}
            otherUserName={conversationParams.otherUserName}
            onSendMessage={async content => {
              await sendMessageUseCase.execute(
                conversationParams.conversationId,
                content,
              );
            }}
            onLoadMessages={async cursor => {
              return getMessagesUseCase.execute(
                conversationParams.conversationId,
                50,
                cursor,
              );
            }}
            onSubscribe={callback => {
              return subscribeToConversationUseCase.execute(
                conversationParams.conversationId,
                callback,
              );
            }}
            onBack={() => setCurrentScreen('Matches')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.textLight,
    paddingVertical: 8,
  },
  tabItemActive: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default App;
