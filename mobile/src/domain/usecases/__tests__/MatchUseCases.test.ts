import {
  EnsureConversationUseCase,
  GetMatchesUseCase,
  LikeUserUseCase,
} from '../MatchUseCases';
import {IMatchRepository} from '../../repositories/IMatchRepository';
import {DiscoveryProfile, Like, Match, MatchStatus} from '../../entities/Match';

class MockMatchRepository implements IMatchRepository {
  ensureConversationCalls: string[] = [];
  matchForLike?: Match;

  async getDiscoveryProfiles(): Promise<DiscoveryProfile[]> {
    return [];
  }

  async likeUser(_userId: string): Promise<{like: Like; match?: Match}> {
    return {
      like: {
        id: 'like_1',
        fromUserId: 'user_1',
        toUserId: 'user_2',
        createdAt: new Date(),
      },
      match: this.matchForLike,
    };
  }

  async passUser(): Promise<void> {}

  async getMatches(): Promise<Match[]> {
    return [
      {
        id: 'match_1',
        userIds: ['user_1', 'user_2'] as [string, string],
        createdAt: new Date(),
        conversationId: undefined,
        status: MatchStatus.ACTIVE,
      },
    ];
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find(match => match.id === matchId) || null;
  }

  async ensureConversation(matchId: string): Promise<string> {
    this.ensureConversationCalls.push(matchId);
    return 'conv_1';
  }
}

describe('MatchUseCases', () => {
  it('ensures a conversation for a match', async () => {
    const repository = new MockMatchRepository();
    const useCase = new EnsureConversationUseCase(repository);

    const conversationId = await useCase.execute('match_1');

    expect(conversationId).toBe('conv_1');
    expect(repository.ensureConversationCalls).toEqual(['match_1']);
  });

  it('returns matches without crashing when conversationId is missing', async () => {
    const repository = new MockMatchRepository();
    const useCase = new GetMatchesUseCase(repository);

    const matches = await useCase.execute();

    expect(matches).toHaveLength(1);
    expect(matches[0].conversationId).toBeUndefined();
  });

  it('returns match info when like creates a match', async () => {
    const repository = new MockMatchRepository();
    repository.matchForLike = {
      id: 'match_2',
      userIds: ['user_1', 'user_2'],
      createdAt: new Date(),
      status: MatchStatus.ACTIVE,
    };
    const useCase = new LikeUserUseCase(repository);

    const result = await useCase.execute('user_2');

    expect(result.match?.id).toBe('match_2');
  });
});
