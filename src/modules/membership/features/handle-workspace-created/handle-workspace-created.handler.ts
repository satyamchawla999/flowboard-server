import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import { WorkspaceCreatedEvent } from '@modules/workspace/domain/events/workspace-created.event';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import { MemberJoinedEvent } from '../../domain/events/member-joined.event';

@Injectable()
export class HandleWorkspaceCreatedHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @OnEvent(WorkspaceCreatedEvent.EVENT_NAME)
  @Transactional()
  async execute(event: WorkspaceCreatedEvent): Promise<void> {
    const existing = await this.memberRepository.findByWorkspaceAndUser(
      event.workspaceId,
      event.ownerId,
    );
    if (existing) return;

    const owner = WorkspaceMember.create({
      workspaceId: event.workspaceId,
      userId: event.ownerId,
      role: WorkspaceMemberRole.OWNER,
    });

    await this.memberRepository.save(owner);
    await this.outbox.store([
      new MemberJoinedEvent(owner.workspaceId, owner.id, owner.userId, owner.role),
    ]);
  }
}
