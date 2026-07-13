import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '../../domain/contracts/project-user-profile.repository';
import { ProjectUserProfile } from '../../domain/read-models/project-user-profile.read-model';

interface IdentityUserProfileEvent {
  userId: string;
  email: string;
  displayName: string;
}

const USER_REGISTERED_EVENT = 'identity.user.registered';
const USER_PROFILE_UPDATED_EVENT = 'identity.user.profile_updated';

@Injectable()
export class ProjectUserProfileProjectionService {
  constructor(
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IProjectUserProfileRepository,
  ) {}

  @OnEvent(USER_REGISTERED_EVENT)
  async handleUserRegistered(event: IdentityUserProfileEvent): Promise<void> {
    await this.upsertProfile(event);
  }

  @OnEvent(USER_PROFILE_UPDATED_EVENT)
  async handleUserProfileUpdated(event: IdentityUserProfileEvent): Promise<void> {
    await this.upsertProfile(event);
  }

  private async upsertProfile(event: IdentityUserProfileEvent): Promise<void> {
    const existing = await this.profileRepository.findByUserId(event.userId);

    if (existing) {
      existing.updateProfile(event.email, event.displayName);
      await this.profileRepository.save(existing);
      return;
    }

    await this.profileRepository.save(
      ProjectUserProfile.create({
        userId: event.userId,
        email: event.email,
        displayName: event.displayName,
      }),
    );
  }
}
