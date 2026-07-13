import { Injectable } from '@nestjs/common';
import { InsufficientWorkspacePermissionError } from '../../domain/errors/membership.errors';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import { MembershipPolicyService } from './membership-policy.service';

@Injectable()
export class MembershipAccessService {
  constructor(private readonly membershipPolicy: MembershipPolicyService) {}

  async ensureMember(userId: string, workspaceId: string): Promise<void> {
    await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
  }

  async ensureOwner(userId: string, workspaceId: string): Promise<void> {
    const member = await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    if (member.role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
  }

  async ensureAdminOrOwner(userId: string, workspaceId: string): Promise<void> {
    const member = await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    this.membershipPolicy.ensureAdminOrOwner(member);
  }

  async getRole(userId: string, workspaceId: string): Promise<WorkspaceMemberRole> {
    const member = await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    return member.role;
  }

  async isAdminOrOwner(userId: string, workspaceId: string): Promise<boolean> {
    const role = await this.getRole(userId, workspaceId);
    return role === WorkspaceMemberRole.OWNER || role === WorkspaceMemberRole.ADMIN;
  }
}
