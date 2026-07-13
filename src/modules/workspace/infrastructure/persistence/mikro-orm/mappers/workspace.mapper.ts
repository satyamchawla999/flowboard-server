import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Workspace } from '../../../../domain/models/workspace.model';
import { WorkspacePreferences } from '../../../../domain/value-objects/workspace-preferences.vo';
import { WorkspaceEntity } from '../entities/workspace.entity';

@Injectable()
export class WorkspaceMapper implements IMapper<Workspace, WorkspaceEntity> {
  toDomain(entity: WorkspaceEntity): Workspace {
    return Workspace.reconstitute({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      logo: entity.logo,
      timezone: entity.timezone,
      ownerId: entity.ownerId,
      isArchived: entity.isArchived,
      isDeleted: entity.isDeleted,
      preferences: WorkspacePreferences.create({
        defaultTaskView: entity.defaultTaskView,
        defaultTimezone: entity.defaultTimezone,
        notificationSettings: entity.notificationSettings,
        automationRules: entity.automationRules,
        customStatuses: entity.customStatuses,
      }),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Workspace): WorkspaceEntity {
    const entity = new WorkspaceEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.slug = domain.slug;
    entity.description = domain.description;
    entity.logo = domain.logo;
    entity.timezone = domain.timezone;
    entity.ownerId = domain.ownerId;
    entity.isArchived = domain.isArchived;
    entity.isDeleted = domain.isDeleted;

    // Flatten preferences object into columns
    entity.defaultTaskView = domain.preferences.defaultTaskView;
    entity.defaultTimezone = domain.preferences.defaultTimezone;
    entity.notificationSettings = domain.preferences.notificationSettings;
    entity.automationRules = domain.preferences.automationRules;
    entity.customStatuses = domain.preferences.customStatuses;

    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
