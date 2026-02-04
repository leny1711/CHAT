import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FlatList, KeyboardAvoidingView, StyleSheet} from 'react-native';
import {ConversationScreen} from '../ConversationScreen';
import {
  Message,
  MessageStatus,
  MessageType,
} from '../../../domain/entities/Message';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  CHAT_INPUT_EXTRA_BOTTOM_PADDING,
} from '../ConversationScreen';
import {CONVERSATION_INTRO_MESSAGE} from '../../constants/conversationMessages';

const buildMessage = (overrides?: Partial<Message>): Message => ({
  id: 'msg_1',
  conversationId: 'conv_1',
  senderId: 'user_1',
  content: 'Salut',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  status: MessageStatus.SENT,
  type: MessageType.TEXT,
  ...overrides,
});

const renderConversation = async (messages: Message[]) => {
  const onLoadMessages = jest.fn().mockResolvedValue({
    messages,
    hasMore: false,
    nextCursor: undefined,
  });
  const onSendMessage = jest.fn().mockResolvedValue(undefined);
  const onSubscribe = jest.fn().mockReturnValue(jest.fn());

  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: {x: 0, y: 0, width: 320, height: 640},
          insets: {top: 0, bottom: 12, left: 0, right: 0},
        }}>
        <ConversationScreen
          conversationId="conv_1"
          otherUserName="Alex"
          currentUserId="user_1"
          onSendMessage={onSendMessage}
          onLoadMessages={onLoadMessages}
          onSubscribe={onSubscribe}
        />
      </SafeAreaProvider>,
    );
  });

  const loadPromise = onLoadMessages.mock.results[0]?.value;
  if (loadPromise) {
    await act(async () => {
      await loadPromise;
    });
  }

  const list = tree!.root.findByType(FlatList);
  return {
    data: list.props.data as Message[],
    keyExtractor: list.props.keyExtractor as (item: Message) => string,
    tree: tree!,
  };
};

describe('ConversationScreen', () => {
  it('uses a unique identifier when available', async () => {
    const message = buildMessage({id: 'msg_unique'});
    const {keyExtractor} = await renderConversation([message]);

    expect(keyExtractor(message)).toBe('msg_unique');
  });

  it('deduplicates messages with the same identifier', async () => {
    const first = buildMessage({id: 'msg_1'});
    const second = buildMessage({
      id: 'msg_1',
      senderId: 'user_2',
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
    });
    const {data} = await renderConversation([first, second]);

    expect(data).toHaveLength(2);
    const textMessages = data.filter(item => item.type === MessageType.TEXT);
    expect(textMessages).toHaveLength(1);
    expect(textMessages[0]).toBe(first);
  });

  it('falls back to message metadata when id is missing', async () => {
    const message = buildMessage({id: ''});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const {keyExtractor} = await renderConversation([message]);

    expect(keyExtractor(message)).toBe(
      `${message.createdAt.toISOString()}-${message.senderId}-${
        message.content
      }`,
    );
    warnSpy.mockRestore();
  });

  it('wraps the list and input in a single keyboard avoiding view', async () => {
    const {tree} = await renderConversation([]);
    const keyboardViews = tree.root.findAllByType(KeyboardAvoidingView);

    expect(keyboardViews).toHaveLength(1);
    const keyboardRoot = keyboardViews[0];
    expect(keyboardRoot.findByType(FlatList)).toBeTruthy();
    expect(
      keyboardRoot.findByProps({
        testID: 'conversation-input-safe-area',
      }),
    ).toBeTruthy();
  });

  it('uses a flexible input container height', async () => {
    const {tree} = await renderConversation([]);
    const inputContainer = tree.root.findByProps({
      testID: 'conversation-input-container',
    });
    const containerStyle = StyleSheet.flatten(inputContainer.props.style);

    expect(containerStyle.height).toBeUndefined();
  });

  it('adds safe area padding to the input container', async () => {
    const {tree} = await renderConversation([]);
    const inputContainer = tree.root.findByProps({
      testID: 'conversation-input-container',
    });
    const containerStyle = StyleSheet.flatten(inputContainer.props.style);

    expect(containerStyle.paddingBottom).toBe(
      12 + CHAT_INPUT_EXTRA_BOTTOM_PADDING,
    );
  });

  it('adds intro message only when conversation is empty', async () => {
    const {data} = await renderConversation([]);
    expect(data).toHaveLength(1);
    expect(data[0].type).toBe(MessageType.SYSTEM);
    expect(data[0].content).toBe(CONVERSATION_INTRO_MESSAGE);
  });

  it('does not add intro message when conversation has history', async () => {
    const message = buildMessage();
    const {data} = await renderConversation([message]);
    expect(data).toHaveLength(2);
    const textMessages = data.filter(item => item.type === MessageType.TEXT);
    expect(textMessages).toHaveLength(1);
    expect(textMessages[0]).toBe(message);
    expect(textMessages[0].type).toBe(MessageType.TEXT);
  });
});
