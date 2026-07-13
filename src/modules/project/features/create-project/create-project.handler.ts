import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '../../domain/contracts/project-section.repository';
import { Project } from '../../domain/models/project.model';
import { ProjectMember } from '../../domain/models/project-member.model';
import { ProjectSection } from '../../domain/models/project-section.model';
import { ProjectKeyAlreadyExistsError } from '../../domain/errors/project.errors';
import { ProjectMemberRole } from '../../domain/value-objects/project-member-role.vo';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';
import type { CreateProjectDto } from './create-project.dto';

@Injectable()
export class CreateProjectHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly projectSectionRepository: IProjectSectionRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: CreateProjectDto): Promise<Project> {
    await this.projectAccess.ensureCanCreateProject(actorUserId, dto.workspaceId);

    const ownerUserId = dto.ownerUserId ?? actorUserId;
    await this.projectAccess.ensureWorkspaceMember(ownerUserId, dto.workspaceId);

    const key = await this.resolveKey(
      dto.workspaceId,
      dto.key ?? Project.keyCandidateFromName(dto.name),
    );

    const project = Project.create({
      workspaceId: dto.workspaceId,
      name: dto.name,
      key,
      description: dto.description,
      ownerUserId,
      createdByUserId: actorUserId,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
    });

    const ownerMember = ProjectMember.create({
      workspaceId: project.workspaceId,
      projectId: project.id,
      userId: ownerUserId,
      role: ProjectMemberRole.OWNER,
    });

    const defaultSection = ProjectSection.create({
      workspaceId: project.workspaceId,
      projectId: project.id,
      name: 'General',
      position: 1000,
      actorUserId,
    });

    await this.projectRepository.save(project);
    await this.projectMemberRepository.save(ownerMember);
    await this.projectSectionRepository.save(defaultSection);
    this.eventDispatcher.dispatchAggregateEvents(project);
    this.eventDispatcher.dispatchAggregateEvents(defaultSection);

    return project;
  }

  private async resolveKey(workspaceId: string, key: string): Promise<string> {
    const baseKey = Project.normalizeKey(key);
    if (!(await this.projectRepository.existsByWorkspaceAndKey(workspaceId, baseKey))) {
      return baseKey;
    }

    for (let suffix = 2; suffix <= 999; suffix += 1) {
      const candidate = Project.normalizeKey(
        `${baseKey.slice(0, 12 - String(suffix).length)}${suffix}`,
      );
      if (!(await this.projectRepository.existsByWorkspaceAndKey(workspaceId, candidate))) {
        return candidate;
      }
    }

    throw new ProjectKeyAlreadyExistsError(workspaceId, baseKey);
  }
}
