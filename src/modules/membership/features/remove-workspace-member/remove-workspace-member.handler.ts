import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import {
  CannotRemoveLastOwnerError,
  InsufficientWorkspacePermissionError,
} from '../../domain/errors/membership.errors';
import { MemberRemovedEvent } from '../../domain/events/member-removed.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import type { RemoveWorkspaceMemberDto } from './remove-workspace-member.dto';

@Injectable()
export class RemoveWorkspaceMemberHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: RemoveWorkspaceMemberDto): Promise<void> {
    const actor = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, actorUserId);
    const target = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, dto.userId);

    if (target.role === WorkspaceMemberRole.OWNER) {
      await this.membershipPolicy.ensureNotLastOwner(dto.workspaceId);
    }

    if (actor.role === WorkspaceMemberRole.OWNER) {
      if (target.role === WorkspaceMemberRole.OWNER) {
        throw new CannotRemoveLastOwnerError();
      }
    } else if (actor.role === WorkspaceMemberRole.ADMIN) {
      if (target.role !== WorkspaceMemberRole.MEMBER) {
        throw new InsufficientWorkspacePermissionError();
      }
    } else {
      throw new InsufficientWorkspacePermissionError();
    }

    await this.memberRepository.delete(target.id);
    await this.outbox.store([
      new MemberRemovedEvent(
        target.workspaceId,
        target.id,
        target.userId,
        target.role,
        actorUserId,
      ),
    ]);
  }
}
