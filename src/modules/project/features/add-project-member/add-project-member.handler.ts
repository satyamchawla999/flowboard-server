import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import { ProjectMember } from '../../domain/models/project-member.model';
import {
  ProjectMemberAlreadyExistsError,
  ProjectNotFoundError,
} from '../../domain/errors/project.errors';
import { ProjectMemberAddedEvent } from '../../domain/events/project-member-added.event';
import { ProjectMemberRole } from '../../domain/value-objects/project-member-role.vo';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import type { AddProjectMemberDto } from './add-project-member.dto';

@Injectable()
export class AddProjectMemberHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: AddProjectMemberDto): Promise<ProjectMember> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.projectAccess.ensureCanManageProject(actorUserId, project);
    await this.projectAccess.ensureWorkspaceMember(dto.userId, project.workspaceId);

    const existing = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      dto.userId,
    );
    if (existing) throw new ProjectMemberAlreadyExistsError(project.id, dto.userId);

    const member = ProjectMember.create({
      workspaceId: project.workspaceId,
      projectId: project.id,
      userId: dto.userId,
      role: ProjectMemberRole.MEMBER,
    });

    await this.projectMemberRepository.save(member);
    await this.outbox.store([
      new ProjectMemberAddedEvent(
        member.projectId,
        member.workspaceId,
        member.userId,
        member.role,
        actorUserId,
      ),
    ]);
    return member;
  }
}
