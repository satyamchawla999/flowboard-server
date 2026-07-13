import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import type { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import { InsufficientWorkspacePermissionError } from '../../domain/errors/membership.errors';
import { OwnershipTransferredEvent } from '../../domain/events/ownership-transferred.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import type { TransferWorkspaceOwnershipDto } from './transfer-workspace-ownership.dto';

@Injectable()
export class TransferWorkspaceOwnershipHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: TransferWorkspaceOwnershipDto): Promise<WorkspaceMember> {
    const actor = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, actorUserId);
    if (actor.role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
    if (actorUserId === dto.targetUserId) {
      throw new InsufficientWorkspacePermissionError();
    }

    const target = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, dto.targetUserId);
    target.changeRole(WorkspaceMemberRole.OWNER);
    actor.changeRole(WorkspaceMemberRole.ADMIN);

    await this.memberRepository.save(target);
    await this.memberRepository.save(actor);
    this.eventEmitter.emit(
      OwnershipTransferredEvent.EVENT_NAME,
      new OwnershipTransferredEvent(dto.workspaceId, actorUserId, target.userId),
    );

    return target;
  }
}
