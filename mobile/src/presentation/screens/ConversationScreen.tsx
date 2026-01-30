import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {theme} from '../theme/theme';
import {Message} from '../../domain/entities/Message';

interface ConversationScreenProps {
  conversationId: string;
  otherUserName: string;
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onLoadMessages: (cursor?: string) => Promise<{
    messages: Message[];
    hasMore: boolean;
    nextCursor?: string;
  }>;
  onSubscribe: (callback: (message: Message) => void) => () => void;
  onBack?: () => void;
  onOpenProfile?: () => void;
}

/**
 * Conversation Screen
 * Critical: Designed to handle infinite message history
 * Uses pagination to load messages efficiently
 */
export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  conversationId,
  otherUserName,
  currentUserId,
  onSendMessage,
  onLoadMessages,
  onSubscribe,
  onBack,
  onOpenProfile,
}) => {
  const resolvedOtherUserName =
    otherUserName && otherUserName.trim()
      ? otherUserName.trim()
      : 'Utilisateur';
  useEffect(() => {
    if (__DEV__ && !conversationId) {
      console.warn(
        'ConversationScreen: conversationId not yet available, will load messages once conversation is ensured',
      );
    }
  }, [conversationId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const flatListRef = useRef<FlatList>(null);

  // Load initial messages only when conversationId is ready.
  useEffect(() => {
    if (!conversationId) {
      return;
    }
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) {
      return () => {};
    }
    const unsubscribe = onSubscribe(newMessage => {
      setMessages(prev => [newMessage, ...prev]);
      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({offset: 0, animated: true});
      }, 100);
    });

    return unsubscribe;
  }, [conversationId, onSubscribe]);

  const loadInitialMessages = async () => {
    setLoading(true);
    try {
      const result = await onLoadMessages();
      // Guard against malformed payloads to keep chat stable in production.
      if (!result || !Array.isArray(result.messages)) {
        console.warn(
          'ConversationScreen: messages payload invalid while loading conversation',
        );
        setMessages([]);
        setHasMore(false);
        setCursor(undefined);
        return;
      }
      setMessages(result.messages);
      setHasMore(!!result.hasMore);
      setCursor(result.nextCursor);
    } catch (error) {
      console.warn('ConversationScreen: error loading messages', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !cursor) {
      return;
    }

    setLoadingMore(true);
    try {
      const result = await onLoadMessages(cursor);
      // Guard against malformed payloads to avoid rendering crashes.
      if (!result || !Array.isArray(result.messages)) {
        console.warn(
          'ConversationScreen: messages payload invalid while loading more',
        );
        setHasMore(false);
        setCursor(undefined);
        return;
      }
      setMessages(prev => [...prev, ...result.messages]);
      setHasMore(!!result.hasMore);
      setCursor(result.nextCursor);
    } catch (error) {
      console.warn('ConversationScreen: error loading more messages', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }

    if (!conversationId) {
      // Safeguard: avoid sending until conversationId is available.
      console.warn('ConversationScreen: conversationId missing, send blocked');
      return;
    }

    const messageText = inputText.trim();
    setInputText('');

    try {
      await onSendMessage(messageText);
    } catch (error) {
      console.warn('ConversationScreen: error sending message', error);
      // Restore message on error
      setInputText(messageText);
    }
  };

  const getMessageIdentity = useCallback((message: Message): string => {
    if (message?.id) {
      return message.id;
    }
    const createdAt = message?.createdAt
      ? new Date(message.createdAt).toISOString()
      : '';
    const senderId = message?.senderId ?? '';
    const content = message?.content ?? '';
    return `${createdAt}-${senderId}-${content}`;
  }, []);

  const dedupedMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter(message => {
      const key = getMessageIdentity(message);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [messages, getMessageIdentity]);

  const getMessageKey = useCallback(
    (message: Message): string => getMessageIdentity(message),
    [getMessageIdentity],
  );

  const renderMessage = ({item}: {item: Message}) => {
    // Guard against invalid messages so rendering never crashes.
    if (!item || !item.senderId) {
      console.warn('ConversationScreen: skipping invalid message payload');
      return null;
    }
    const isOwn = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.ownText : styles.otherText,
            ]}>
            {item.content ?? ''}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isOwn ? styles.ownTime : styles.otherTime,
            ]}>
            {item.createdAt ? formatTime(item.createdAt) : '--:--'}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingMoreText}>
          Chargement des messages précédents…
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!conversationId) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.initializingText}>
          Initialisation de la conversation…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          {onOpenProfile ? (
            <TouchableOpacity
              onPress={onOpenProfile}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le profil de ${resolvedOtherUserName}`}>
              <Text style={[styles.headerTitle, styles.headerLink]}>
                {resolvedOtherUserName}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.headerTitle}>{resolvedOtherUserName}</Text>
          )}
          <Text style={styles.headerSubtitle}>Conversation privée</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={dedupedMessages}
          renderItem={renderMessage}
          keyExtractor={getMessageKey}
          inverted
          style={styles.messageListContainer}
          contentContainerStyle={styles.messageList}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            placeholderTextColor={theme.colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!!conversationId}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || !conversationId) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || !conversationId}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const formatTime = (date: Date): string => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  initializingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  headerContent: {
    // Empty for now, just a wrapper
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.text,
  },
  headerLink: {
    textDecorationLine: 'underline',
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  messageListContainer: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: theme.spacing.xs,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight:
      theme.typography.lineHeight.normal * theme.typography.fontSize.md,
  },
  ownText: {
    color: theme.colors.surface,
  },
  otherText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  ownTime: {
    color: theme.colors.surface,
    opacity: 0.8,
  },
  otherTime: {
    color: theme.colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  loadingMore: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
