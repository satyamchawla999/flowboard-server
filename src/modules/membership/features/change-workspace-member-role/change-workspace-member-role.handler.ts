import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import type { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import {
  CannotChangeOwnOwnerRoleError,
  InsufficientWorkspacePermissionError,
} from '../../domain/errors/membership.errors';
import { MemberRoleChangedEvent } from '../../domain/events/member-role-changed.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import type { ChangeWorkspaceMemberRoleDto } from './change-workspace-member-role.dto';

@Injectable()
export class ChangeWorkspaceMemberRoleHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: ChangeWorkspaceMemberRoleDto): Promise<WorkspaceMember> {
    const actor = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, actorUserId);
    if (actor.role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
    if (actorUserId === dto.userId && actor.role === WorkspaceMemberRole.OWNER) {
      throw new CannotChangeOwnOwnerRoleError();
    }
    if (dto.role === WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }

    const target = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, dto.userId);
    if (target.role === WorkspaceMemberRole.OWNER) {
      throw new CannotChangeOwnOwnerRoleError();
    }

    const previousRole = target.role;
    target.changeRole(dto.role);
    await this.memberRepository.save(target);
    await this.outbox.store([
      new MemberRoleChangedEvent(
        target.workspaceId,
        target.id,
        target.userId,
        previousRole,
        target.role,
        actorUserId,
      ),
    ]);

    return target;
  }
}
