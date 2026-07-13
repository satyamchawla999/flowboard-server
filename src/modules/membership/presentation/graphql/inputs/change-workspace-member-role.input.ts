import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { WorkspaceMemberRole } from '../../../domain/value-objects/workspace-member-role.vo';

@InputType()
export class ChangeWorkspaceMemberRoleInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field(() => WorkspaceMemberRole)
  @IsEnum(WorkspaceMemberRole)
  role!: WorkspaceMemberRole;
}
