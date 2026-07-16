import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import { CannotLeaveAsLastOwnerError } from '../../domain/errors/membership.errors';
import { MemberLeftEvent } from '../../domain/events/member-left.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';

@Injectable()
export class LeaveWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @Transactional()
  async execute(userId: string, workspaceId: string): Promise<void> {
    const member = await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    if (member.role === WorkspaceMemberRole.OWNER) {
      const ownerCount = await this.memberRepository.countByWorkspaceAndRole(
        workspaceId,
        WorkspaceMemberRole.OWNER,
      );
      if (ownerCount <= 1) throw new CannotLeaveAsLastOwnerError();
    }

    await this.memberRepository.delete(member.id);
    await this.outbox.store([
      new MemberLeftEvent(member.workspaceId, member.id, member.userId, member.role),
    ]);
  }
}
