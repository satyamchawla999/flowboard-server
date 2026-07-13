import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectMemberRole } from '../../../domain/value-objects/project-member-role.vo';

registerEnumType(ProjectMemberRole, { name: 'ProjectMemberRole' });

@ObjectType()
export class ProjectUserGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;
}

@ObjectType()
export class ProjectMemberGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ProjectMemberRole)
  role!: ProjectMemberRole;

  @Field()
  joinedAt!: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => ProjectUserGqlModel, { nullable: true })
  user?: ProjectUserGqlModel;
}
