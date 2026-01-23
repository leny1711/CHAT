import {MessageRepository} from '../MessageRepository';
import {apiClient} from '../../../infrastructure/api/client';
import {wsClient} from '../../../infrastructure/api/websocket';

jest.mock('../../../infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../../infrastructure/api/websocket', () => ({
  wsClient: {
    subscribe: jest.fn(),
  },
}));

describe('MessageRepository', () => {
  beforeEach(() => {
    (apiClient.get as jest.Mock).mockReset();
    (wsClient.subscribe as jest.Mock).mockReturnValue(() => {});
  });

  it('sorts messages by createdAt desc with id tiebreaker', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      messages: [
        {
          id: 'msg_2',
          conversation_id: 'conv_1',
          sender_id: 'user_1',
          content: 'Second',
          type: 'text',
          status: 'sent',
          created_at: '2024-01-01T12:00:00.000Z',
        },
        {
          id: 'msg_3',
          conversation_id: 'conv_1',
          sender_id: 'user_1',
          content: 'Third',
          type: 'text',
          status: 'sent',
          created_at: '2024-01-01T12:00:00.000Z',
        },
        {
          id: 'msg_1',
          conversation_id: 'conv_1',
          sender_id: 'user_1',
          content: 'First',
          type: 'text',
          status: 'sent',
          created_at: '2024-01-02T09:00:00.000Z',
        },
      ],
      hasMore: false,
      totalCount: 3,
    });

    const repository = new MessageRepository();
    const result = await repository.getMessages('conv_1', 50);

    expect(result.messages.map(message => message.id)).toEqual([
      'msg_1',
      'msg_3',
      'msg_2',
    ]);
  });

  it('maps other user profile photo in conversations', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      conversations: [
        {
          id: 'conv_1',
          match_id: 'match_1',
          created_at: '2024-01-01T00:00:00.000Z',
          last_message_at: '2024-01-02T00:00:00.000Z',
          otherUser: {
            id: 'user_2',
            name: 'Alex',
            age: 29,
            bio: 'Bio',
            profile_photo: 'https://example.com/photo.jpg',
          },
        },
      ],
    });

    const repository = new MessageRepository();
    const conversations = await repository.getConversations();

    expect(conversations[0]?.otherUser?.profilePhotoUrl).toBe(
      'https://example.com/photo.jpg',
    );
  });
});
