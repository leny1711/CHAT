import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FlatList, KeyboardAvoidingView, StyleSheet} from 'react-native';
import {ConversationScreen} from '../ConversationScreen';
import {
  Message,
  MessageStatus,
  MessageType,
} from '../../../domain/entities/Message';
import {theme} from '../../theme/theme';

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
      <ConversationScreen
        conversationId="conv_1"
        otherUserName="Alex"
        currentUserId="user_1"
        onSendMessage={onSendMessage}
        onLoadMessages={onLoadMessages}
        onSubscribe={onSubscribe}
      />,
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

    expect(data).toHaveLength(1);
    expect(data[0]).toBe(first);
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
        testID: 'conversation-input-container',
      }),
    ).toBeTruthy();
  });

  it('uses a fixed height for the input container', async () => {
    const {tree} = await renderConversation([]);
    const inputContainer = tree.root.findByProps({
      testID: 'conversation-input-container',
    });
    const containerStyle = StyleSheet.flatten(inputContainer.props.style);

    expect(containerStyle.height).toBe(theme.spacing.xxl + theme.spacing.md);
  });

  it('does not add bottom padding to the input container or message list', async () => {
    const {tree} = await renderConversation([]);
    const inputContainer = tree.root.findByProps({
      testID: 'conversation-input-container',
    });
    const containerStyle = StyleSheet.flatten(inputContainer.props.style);
    const list = tree.root.findByType(FlatList);
    const listStyle = StyleSheet.flatten(list.props.contentContainerStyle);

    expect(containerStyle.paddingBottom).toBeUndefined();
    expect(listStyle.paddingBottom).toBeUndefined();
  });
});
