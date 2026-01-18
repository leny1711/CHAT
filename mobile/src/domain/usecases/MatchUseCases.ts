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
    const like = await this.matchRepository.likeUser(userId);

    // Check if this creates a match
    const match = await this.matchRepository.checkMatch(
      like.fromUserId,
      userId,
    );

    return {like, match: match || undefined};
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
