/**
 * Minimal Dating App Core
 *
 * Simple state-based navigation without external libraries
 * No animations, no complex navigation, just the essentials
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View, Text} from 'react-native';

// Screens
import {LoginScreen} from './src/presentation/screens/LoginScreen';
import {RegisterScreen} from './src/presentation/screens/RegisterScreen';
import {SimpleDiscoveryScreen} from './src/presentation/screens/SimpleDiscoveryScreen';
import {MatchesScreen} from './src/presentation/screens/MatchesScreen';
import {ConversationScreen} from './src/presentation/screens/ConversationScreen';
import {SettingsScreen} from './src/presentation/screens/SettingsScreen';

// Repositories
import {UserRepository} from './src/data/repositories/UserRepository';
import {MessageRepository} from './src/data/repositories/MessageRepository';
import {MatchRepository} from './src/data/repositories/MatchRepository';

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
const userRepository = new UserRepository();
const messageRepository = new MessageRepository();
const matchRepository = new MatchRepository();

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
      Découvrir
    </Text>
    <Text
      style={[
        styles.tabItem,
        currentScreen === 'Matches' && styles.tabItemActive,
      ]}
      onPress={() => onNavigate('Matches')}>
      Matchs
    </Text>
    <Text
      style={[
        styles.tabItem,
        currentScreen === 'Profile' && styles.tabItemActive,
      ]}
      onPress={() => onNavigate('Profile')}>
      Profil
    </Text>
  </View>
);

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [conversationParams, setConversationParams] =
    useState<ConversationParams | null>(null);

  // Initialize auth on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await userRepository.initializeAuth();
        if (user) {
          setCurrentUser(user);
          setCurrentScreen('Discovery');
        }
        // If user is null, it means no valid session exists
        // This is expected behavior, not an error
      } catch (error) {
        // Unexpected errors only - initializeAuth handles auth failures internally
        console.warn('Failed to initialize auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password);
    setCurrentUser(user);
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
    setCurrentScreen('Discovery');
  };

  const handleLogout = async () => {
    await logoutUseCase.execute();
    setCurrentUser(null);
    setCurrentScreen('Login');
  };

  const handleSelectMatch = async (match: Match) => {
    // Get the other user's details
    // BUG: conversationId was previously dropped before opening chat.
    // FIX: guard against missing conversationId and log the navigation payload.
    if (!match.conversationId) {
      console.warn('Cannot open conversation without conversationId', {
        matchId: match.id,
      });
      return;
    }
    const otherUserId = match.userIds.find(id => id !== currentUser?.id) || '';
    const otherUser = await userRepository.getUserById(otherUserId);

    if (__DEV__) {
      console.log('Navigating to conversation', {
        matchId: match.id,
        conversationId: match.conversationId,
      });
    }

    setConversationParams({
      conversationId: match.conversationId,
      matchId: match.id,
      otherUserName: otherUser?.name || match.otherUser?.name || 'Utilisateur',
    });
    setCurrentScreen('Conversation');
  };

  const renderScreen = () => {
    // Show loading while initializing
    if (isInitializing) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

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
              getUserById={async userId => {
                return userRepository.getUserById(userId);
              }}
              currentUserId={currentUser.id}
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
            currentUserId={currentUser.id}
            onSendMessage={async content => {
              if (__DEV__) {
                console.log('Sending message payload', {
                  conversationId: conversationParams.conversationId,
                  contentLength: content.length,
                });
              }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
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
