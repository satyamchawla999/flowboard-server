import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import { ProjectMember } from '../../domain/models/project-member.model';
import {
  ProjectNotFoundError,
  ProjectOwnershipTransferInvalidError,
} from '../../domain/errors/project.errors';
import { ProjectMemberRole } from '../../domain/value-objects/project-member-role.vo';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';
import type { TransferProjectOwnershipDto } from './transfer-project-ownership.dto';

@Injectable()
export class TransferProjectOwnershipHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: TransferProjectOwnershipDto) {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.projectAccess.ensureCanManageProject(actorUserId, project);
    await this.projectAccess.ensureWorkspaceMember(dto.targetUserId, project.workspaceId);

    if (project.ownerUserId === dto.targetUserId) {
      throw new ProjectOwnershipTransferInvalidError('Target user is already the project owner');
    }

    const previousOwner = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      project.ownerUserId,
    );
    if (!previousOwner) {
      throw new ProjectOwnershipTransferInvalidError('Current project owner membership is missing');
    }

    let target = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      dto.targetUserId,
    );
    if (!target) {
      target = ProjectMember.create({
        workspaceId: project.workspaceId,
        projectId: project.id,
        userId: dto.targetUserId,
        role: ProjectMemberRole.MEMBER,
      });
    }

    previousOwner.changeRole(ProjectMemberRole.MEMBER);
    target.changeRole(ProjectMemberRole.OWNER);
    project.transferOwnership(dto.targetUserId, actorUserId);

    await this.projectRepository.save(project);
    await this.projectMemberRepository.save(previousOwner);
    await this.projectMemberRepository.save(target);
    this.eventDispatcher.dispatchAggregateEvents(project);

    return project;
  }
}
