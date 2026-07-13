import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import {
  ProjectMemberNotFoundError,
  ProjectNotFoundError,
  ProjectOwnerCannotBeRemovedError,
} from '../../domain/errors/project.errors';
import { ProjectMemberRemovedEvent } from '../../domain/events/project-member-removed.event';
import { ProjectMemberRole } from '../../domain/value-objects/project-member-role.vo';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import type { RemoveProjectMemberDto } from './remove-project-member.dto';

@Injectable()
export class RemoveProjectMemberHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: RemoveProjectMemberDto): Promise<void> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.projectAccess.ensureCanManageProject(actorUserId, project);

    const member = await this.projectMemberRepository.findByProjectAndUser(project.id, dto.userId);
    if (!member) throw new ProjectMemberNotFoundError(project.id, dto.userId);
    if (member.role === ProjectMemberRole.OWNER || project.ownerUserId === dto.userId) {
      throw new ProjectOwnerCannotBeRemovedError();
    }

    await this.projectMemberRepository.delete(member.id);
    this.eventEmitter.emit(
      ProjectMemberRemovedEvent.EVENT_NAME,
      new ProjectMemberRemovedEvent(
        member.projectId,
        member.workspaceId,
        member.userId,
        member.role,
        actorUserId,
      ),
    );
  }
}
