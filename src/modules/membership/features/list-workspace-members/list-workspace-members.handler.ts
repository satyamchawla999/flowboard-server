import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import type { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';

@Injectable()
export class ListWorkspaceMembersHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly membershipPolicy: MembershipPolicyService,
  ) {}

  async execute(userId: string, workspaceId: string): Promise<WorkspaceMember[]> {
    await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    return this.memberRepository.findByWorkspaceId(workspaceId);
  }
}
