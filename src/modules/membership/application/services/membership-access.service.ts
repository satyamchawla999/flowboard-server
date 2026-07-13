import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import {
  InsufficientWorkspacePermissionError,
  WorkspaceMemberNotFoundError,
} from '../../domain/errors/membership.errors';

@Injectable()
export class MembershipAccessService {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
  ) {}

  async ensureMember(userId: string, workspaceId: string): Promise<void> {
    const member = await this.memberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!member) throw new WorkspaceMemberNotFoundError(workspaceId, userId);
  }

  async ensureOwner(userId: string, workspaceId: string): Promise<void> {
    const role = await this.getRole(userId, workspaceId);
    if (role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
  }

  async ensureAdminOrOwner(userId: string, workspaceId: string): Promise<void> {
    const role = await this.getRole(userId, workspaceId);
    if (role !== WorkspaceMemberRole.OWNER && role !== WorkspaceMemberRole.ADMIN) {
      throw new InsufficientWorkspacePermissionError();
    }
  }

  async getRole(userId: string, workspaceId: string): Promise<WorkspaceMemberRole> {
    const member = await this.memberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!member) throw new WorkspaceMemberNotFoundError(workspaceId, userId);
    return member.role;
  }
}
