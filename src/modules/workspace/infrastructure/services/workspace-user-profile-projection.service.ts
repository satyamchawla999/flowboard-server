import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IWorkspaceUserProfileRepository,
  WORKSPACE_USER_PROFILE_REPOSITORY,
} from '../../domain/contracts/workspace-user-profile.repository';
import {
  WorkspaceUserAccountStatus,
  WorkspaceUserProfile,
} from '../../domain/read-models/workspace-user-profile.read-model';

interface IdentityUserProfileEvent {
  userId: string;
  email: string;
  displayName: string;
  accountStatus?: string;
}

const USER_REGISTERED_EVENT = 'identity.user.registered';
const USER_PROFILE_UPDATED_EVENT = 'identity.user.profile_updated';

@Injectable()
export class WorkspaceUserProfileProjectionService {
  constructor(
    @Inject(WORKSPACE_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IWorkspaceUserProfileRepository,
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
    const accountStatus = event.accountStatus ?? WorkspaceUserAccountStatus.UNVERIFIED;
    const existing = await this.profileRepository.findByUserId(event.userId);

    if (existing) {
      existing.updateProfile({
        email: event.email,
        displayName: event.displayName,
        accountStatus,
      });
      await this.profileRepository.save(existing);
      return;
    }

    await this.profileRepository.save(
      WorkspaceUserProfile.create({
        userId: event.userId,
        email: event.email,
        displayName: event.displayName,
        accountStatus,
      }),
    );
  }
}
