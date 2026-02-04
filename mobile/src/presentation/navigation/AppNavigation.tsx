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
import {ProfileScreen, UNKNOWN_PROFILE_ID} from '../screens/ProfileScreen';

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
  EnsureConversationUseCase,
} from '../../domain/usecases/MatchUseCases';

import {User} from '../../domain/entities/User';
import {Match} from '../../domain/entities/Match';
import {theme} from '../theme/theme';
import {ActivityIndicator, View, StyleSheet, Text} from 'react-native';
import {useMatchNotice} from '../hooks/useMatchNotice';
import {matchNoticeStyles} from '../styles/matchNoticeStyles';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  authLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
  },
});

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
const ensureConversationUseCase = new EnsureConversationUseCase(
  matchRepository,
);

function MainTabs({onMatchNotice}: {onMatchNotice: () => void}) {
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
        options={{tabBarLabel: 'Découvrir'}}>
        {() => <DiscoveryScreenWrapper onMatchNotice={onMatchNotice} />}
      </Tab.Screen>
      <Tab.Screen
        name="Matches"
        component={MatchesScreenWrapper}
        options={{tabBarLabel: 'Matchs'}}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreenWrapper}
        options={{tabBarLabel: 'Profil'}}
      />
    </Tab.Navigator>
  );
}

function DiscoveryScreenWrapper({
  onMatchNotice,
}: {
  onMatchNotice: () => void;
}) {
  return (
    <DiscoveryScreen
      onLike={async userId => {
        const result = await likeUserUseCase.execute(userId);
        return result.match ?? null;
      }}
      onPass={async userId => {
        await passUserUseCase.execute(userId);
      }}
      getProfiles={async () => {
        return getDiscoveryProfilesUseCase.execute();
      }}
      onMatchNotice={onMatchNotice}
    />
  );
}

function MatchesScreenWrapper({navigation}: any) {
  // TODO: Technical debt - User loading duplicated across components
  // Production solution: Extract to custom useCurrentUser hook or AuthContext
  // Keeping minimal for MVP fix - each screen needs isolated state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUserUseCase.execute();
    setCurrentUser(user);
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    // TODO: Technical debt - Direct repository usage violates clean architecture
    // Should create a GetUserByIdUseCase for consistency with existing patterns
    try {
      return await userRepository.getUserById(userId);
    } catch (error) {
      console.warn('AppNavigation: error getting user', error);
      return null;
    }
  };

  return (
    <MatchesScreen
      onGetMatches={async () => {
        return getMatchesUseCase.execute();
      }}
      onSelectMatch={async (match: Match, otherUser?: User) => {
        // BUG: conversationId was lost between match selection and chat navigation.
        // FIX: use the match payload as the single source of truth and pass it explicitly.
        let conversationId = match.conversationId;
        if (!conversationId) {
          if (__DEV__) {
            console.log('Ensuring conversation for match', {matchId: match.id});
          }
          conversationId = await ensureConversationUseCase.execute(match.id);
        }
        if (__DEV__) {
          console.log('Navigating to conversation', {
            matchId: match.id,
            conversationId,
          });
        }
        const otherUserId =
          otherUser?.id ||
          match.otherUser?.id ||
          match.userIds.find(id => id !== currentUser?.id) ||
          UNKNOWN_PROFILE_ID;
        const otherUserName =
          otherUser?.name || match.otherUser?.name || 'Utilisateur';
        const otherUserBio = otherUser?.bio || match.otherUser?.bio;
        const otherUserPhoto =
          otherUser?.profilePhotoUrl || match.otherUser?.profilePhotoUrl;

        navigation.navigate('Conversation', {
          conversationId,
          matchId: match.id,
          otherUserId,
          otherUserName,
          otherUserPhotoUrl: otherUserPhoto,
          otherUser: {
            id: otherUserId,
            name: otherUserName,
            bio: otherUserBio,
            profilePhotoUrl: otherUserPhoto,
          },
          messageCount: 0,
        });
      }}
      getUserById={getUserById}
      currentUserId={currentUser?.id || ''}
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

function ConversationScreenWrapper({route, navigation}: any) {
  // Single source of truth: always use navigation params for conversationId.
  const conversationId = route.params?.conversationId;
  const otherUser = route.params?.otherUser;
  const otherUserId =
    route.params?.otherUserId || otherUser?.id || UNKNOWN_PROFILE_ID;
  const otherUserPhoto =
    otherUser?.profilePhotoUrl || route.params?.otherUserPhotoUrl;
  // TODO: Technical debt - Duplicated user loading (see MatchesScreenWrapper)
  // Production solution: Shared auth context/custom hook
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUserUseCase.execute();
    setCurrentUser(user);
  };

  if (!conversationId) {
    return (
      <ConversationScreen
        conversationId=""
        otherUserName={route.params?.otherUserName || 'Utilisateur'}
        currentUserId={currentUser?.id || ''}
        onSendMessage={async () => {
          console.warn('AppNavigation: conversationId missing, send blocked');
        }}
        onLoadMessages={async () => ({
          messages: [],
          hasMore: false,
        })}
        onSubscribe={() => () => {}}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <ConversationScreen
      conversationId={conversationId}
      otherUserName={route.params?.otherUserName || 'Utilisateur'}
      currentUserId={currentUser?.id || ''}
      onOpenProfile={async () => {
        let count = 0;
        let resolvedPhotoUrl = otherUserPhoto;
        let resolvedName =
          otherUser?.name || route.params?.otherUserName || 'Utilisateur';
        let resolvedDescription = otherUser?.bio || '';
        try {
          count = await messageRepository.getMessageCount(conversationId);
        } catch (error) {
          console.warn('AppNavigation: error getting message count', error);
        }
        if (!resolvedPhotoUrl?.trim()) {
          try {
            const conversation = await messageRepository.getConversation(
              conversationId,
            );
            if (conversation?.otherUser) {
              resolvedPhotoUrl = conversation.otherUser.profilePhotoUrl;
              resolvedName = conversation.otherUser.name || resolvedName;
              resolvedDescription =
                conversation.otherUser.bio || resolvedDescription;
            }
          } catch (error) {
            console.warn(
              'AppNavigation: error getting conversation profile',
              error,
            );
          }
        }
        navigation.navigate('Profile', {
          userId: otherUserId,
          name: resolvedName,
          description: resolvedDescription,
          photoUrl: resolvedPhotoUrl?.trim(),
          messageCount: count,
        });
      }}
      onSendMessage={async content => {
        if (__DEV__) {
          console.log('Sending message payload', {
            conversationId,
            contentLength: content.length,
          });
        }
        await sendMessageUseCase.execute(conversationId, content);
      }}
      onLoadMessages={async cursor => {
        return getMessagesUseCase.execute(conversationId, 50, cursor);
      }}
      onSubscribe={callback => {
        return subscribeToConversationUseCase.execute(conversationId, callback);
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

export function AppNavigation() {
  const {matchNotice, showMatchNotice} = useMatchNotice();
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
      <View style={styles.authLoadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
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
                      onNavigateToRegister={() =>
                        navigation.navigate('Register')
                      }
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Register">
                  {({navigation}) => (
                    <RegisterScreen
                      onRegister={async (
                        email,
                        password,
                        name,
                        bio,
                        gender,
                        lookingFor,
                        profilePhoto,
                      ) => {
                        await registerUseCase.execute(email, password, {
                          name,
                          bio,
                          gender,
                          lookingFor,
                          profilePhoto,
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
                <Stack.Screen name="Main">
                  {() => <MainTabs onMatchNotice={showMatchNotice} />}
                </Stack.Screen>
                <Stack.Screen
                  name="Conversation"
                  component={ConversationScreenWrapper}
                />
                <Stack.Screen name="Profile">
                  {({route, navigation}) => (
                    <ProfileScreen
                      userId={route.params?.userId || UNKNOWN_PROFILE_ID}
                      name={route.params?.name || 'Utilisateur'}
                      description={route.params?.description || ''}
                      photoUrl={route.params?.photoUrl}
                      messageCount={route.params?.messageCount || 0}
                      onBack={() => navigation.goBack()}
                    />
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        {matchNotice ? (
          <View style={matchNoticeStyles.matchNoticeOverlay} pointerEvents="none">
            <View style={matchNoticeStyles.matchNotice}>
              <Text style={matchNoticeStyles.matchNoticeText}>
                {matchNotice}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}
