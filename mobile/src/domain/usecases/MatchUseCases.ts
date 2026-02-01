import {IMatchRepository} from '../repositories/IMatchRepository';
import {Match, Like, DiscoveryProfile} from '../entities/Match';

/**
 * Use case for getting discovery profiles
 */
export class GetDiscoveryProfilesUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(limit: number = 10): Promise<DiscoveryProfile[]> {
    return this.matchRepository.getDiscoveryProfiles(limit);
  }
}

/**
 * Use case for liking a user
 */
export class LikeUserUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(userId: string): Promise<{like: Like; match?: Match}> {
    return this.matchRepository.likeUser(userId);
  }
}

/**
 * Use case for passing on a user
 */
export class PassUserUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(userId: string): Promise<void> {
    return this.matchRepository.passUser(userId);
  }
}

/**
 * Use case for getting matches
 */
export class GetMatchesUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(): Promise<Match[]> {
    return this.matchRepository.getMatches();
  }
}

/**
 * Use case for ensuring conversation exists for a match
 */
export class EnsureConversationUseCase {
  constructor(private matchRepository: IMatchRepository) {}

  async execute(matchId: string): Promise<string> {
    return this.matchRepository.ensureConversation(matchId);
  }
}
