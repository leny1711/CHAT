import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Screens
import {LoginScreen} from '../screens/LoginScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {DiscoveryScreen} from '../screens/DiscoveryScreen';
import {MatchesScreen} from '../screens/MatchesScreen';
import {ConversationScreen} from '../screens/ConversationScreen';
import {SettingsScreen} from '../screens/SettingsScreen';

// Repositories
import {UserRepository} from '../../data/repositories/UserRepository';
import {MessageRepository} from '../../data/repositories/MessageRepository';
import {MatchRepository} from '../../data/repositories/MatchRepository';

// Use cases
import {
  LoginUseCase,
  RegisterUseCase,
  GetCurrentUserUseCase,
  LogoutUseCase,
} from '../../domain/usecases/AuthUseCases';
import {
  GetMessagesUseCase,
  SendMessageUseCase,
  SubscribeToConversationUseCase,
} from '../../domain/usecases/MessageUseCases';
import {
  GetDiscoveryProfilesUseCase,
  LikeUserUseCase,
  PassUserUseCase,
  GetMatchesUseCase,
} from '../../domain/usecases/MatchUseCases';

import {User} from '../../domain/entities/User';
import {Match} from '../../domain/entities/Match';
import {theme} from '../theme/theme';
import {ActivityIndicator, View} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Initialize repositories
const userRepository = new UserRepository();
const messageRepository = new MessageRepository();
const matchRepository = new MatchRepository();

// Initialize use cases
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.sm,
        },
      }}>
      <Tab.Screen
        name="Discover"
        component={DiscoveryScreenWrapper}
        options={{tabBarLabel: 'Discovery'}}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreenWrapper}
        options={{tabBarLabel: 'Matches'}}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreenWrapper}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

function DiscoveryScreenWrapper() {
  return (
    <DiscoveryScreen
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
  );
}

function MatchesScreenWrapper({navigation}: any) {
  return (
    <MatchesScreen
      onGetMatches={async () => {
        return getMatchesUseCase.execute();
      }}
      onSelectMatch={(match: Match) => {
        navigation.navigate('Conversation', {
          conversationId: match.conversationId,
          matchId: match.id,
        });
      }}
    />
  );
}

function SettingsScreenWrapper({navigation}: any) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUserUseCase.execute();
    setUser(currentUser);
  };

  return (
    <SettingsScreen
      user={user}
      onLogout={async () => {
        await logoutUseCase.execute();
        navigation.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        });
      }}
    />
  );
}

export function AppNavigation() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUserUseCase.execute();
    setIsAuthenticated(!!user);
  };

  if (isAuthenticated === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login">
                {({navigation}) => (
                  <LoginScreen
                    onLogin={async (email, password) => {
                      await loginUseCase.execute(email, password);
                      setIsAuthenticated(true);
                    }}
                    onNavigateToRegister={() => navigation.navigate('Register')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {({navigation}) => (
                  <RegisterScreen
                    onRegister={async (email, password, name, bio) => {
                      await registerUseCase.execute(email, password, {
                        name,
                        bio,
                      });
                      setIsAuthenticated(true);
                    }}
                    onNavigateToLogin={() => navigation.navigate('Login')}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Conversation">
                {({route}: any) => (
                  <ConversationScreen
                    conversationId={route.params.conversationId}
                    otherUserName="Match" // In production, fetch user name
                    onSendMessage={async content => {
                      await sendMessageUseCase.execute(
                        route.params.conversationId,
                        content,
                      );
                    }}
                    onLoadMessages={async cursor => {
                      return getMessagesUseCase.execute(
                        route.params.conversationId,
                        50,
                        cursor,
                      );
                    }}
                    onSubscribe={callback => {
                      return subscribeToConversationUseCase.execute(
                        route.params.conversationId,
                        callback,
                      );
                    }}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
