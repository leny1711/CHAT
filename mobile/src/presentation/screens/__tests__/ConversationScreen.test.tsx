import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FlatList} from 'react-native';
import {ConversationScreen} from '../ConversationScreen';
import {
  Message,
  MessageStatus,
  MessageType,
} from '../../../domain/entities/Message';

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
  return list.props.keyExtractor as (item: Message) => string;
};

describe('ConversationScreen', () => {
  it('uses a unique identifier when available', async () => {
    const message = buildMessage({id: 'msg_unique'});
    const keyExtractor = await renderConversation([message]);

    expect(keyExtractor(message)).toBe('msg_unique');
  });

  it('composes a stable key when ids repeat', async () => {
    const first = buildMessage({
      id: 'msg_1',
      senderId: 'user_1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    const second = buildMessage({
      id: 'msg_1',
      senderId: 'user_2',
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
    });
    const keyExtractor = await renderConversation([first, second]);

    expect(keyExtractor(first)).toBe(
      `msg_1-${first.createdAt.toISOString()}-${first.senderId}`,
    );
    expect(keyExtractor(second)).toBe(
      `msg_1-${second.createdAt.toISOString()}-${second.senderId}`,
    );
  });
});
