import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { WorkspaceInvitationStatus } from '../../../domain/value-objects/workspace-invitation-status.vo';
import { WorkspaceMemberRole } from '../../../domain/value-objects/workspace-member-role.vo';

registerEnumType(WorkspaceInvitationStatus, { name: 'WorkspaceInvitationStatus' });

@ObjectType('WorkspaceInvitation')
export class WorkspaceInvitationGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field()
  email!: string;

  @Field(() => WorkspaceMemberRole)
  role!: WorkspaceMemberRole;

  @Field(() => ID)
  invitedByUserId!: string;

  @Field(() => WorkspaceInvitationStatus)
  status!: WorkspaceInvitationStatus;

  @Field()
  token!: string;

  @Field()
  expiresAt!: Date;

  @Field({ nullable: true })
  acceptedAt?: Date;

  @Field({ nullable: true })
  rejectedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
