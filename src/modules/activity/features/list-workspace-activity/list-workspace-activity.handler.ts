import { Injectable } from '@nestjs/common';
import { MembershipAccessService } from '@modules/membership/infrastructure/services/membership-access.service';
import {
  ActivityConnectionReadModel,
  ActivityFeedService,
} from '../../infrastructure/services/activity-feed.service';
import type { ListWorkspaceActivityDto } from './list-workspace-activity.dto';

@Injectable()
export class ListWorkspaceActivityHandler {
  constructor(
    private readonly membershipAccess: MembershipAccessService,
    private readonly feedService: ActivityFeedService,
  ) {}

  async execute(
    actorUserId: string,
    dto: ListWorkspaceActivityDto,
  ): Promise<ActivityConnectionReadModel> {
    await this.membershipAccess.ensureMember(actorUserId, dto.workspaceId);
    return this.feedService.listWorkspace(dto);
  }
}
