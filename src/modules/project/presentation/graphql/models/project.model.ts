import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectHealthStatus } from '../../../domain/value-objects/project-health-status.vo';
import { ProjectMemberGqlModel, ProjectUserGqlModel } from './project-member.model';

registerEnumType(ProjectHealthStatus, { name: 'ProjectHealthStatus' });

@ObjectType()
export class ProjectGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field()
  name!: string;

  @Field()
  key!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID)
  ownerUserId!: string;

  @Field(() => ID)
  createdByUserId!: string;

  @Field(() => ProjectHealthStatus)
  healthStatus!: ProjectHealthStatus;

  @Field({ nullable: true })
  statusMessage?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field()
  isArchived!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => ProjectUserGqlModel, { nullable: true })
  owner?: ProjectUserGqlModel;

  @Field(() => [ProjectMemberGqlModel])
  members!: ProjectMemberGqlModel[];
}
