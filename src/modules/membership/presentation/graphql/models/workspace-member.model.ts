import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { WorkspaceMemberRole } from '../../../domain/value-objects/workspace-member-role.vo';

registerEnumType(WorkspaceMemberRole, { name: 'WorkspaceMemberRole' });

@ObjectType('WorkspaceMemberUser')
export class WorkspaceMemberUserGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;
}

@ObjectType('WorkspaceMember')
export class WorkspaceMemberGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => WorkspaceMemberRole)
  role!: WorkspaceMemberRole;

  @Field()
  joinedAt!: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => WorkspaceMemberUserGqlModel, { nullable: true })
  user?: WorkspaceMemberUserGqlModel;
}
