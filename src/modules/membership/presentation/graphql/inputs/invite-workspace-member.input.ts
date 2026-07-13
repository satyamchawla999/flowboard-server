import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { WorkspaceMemberRole } from '../../../domain/value-objects/workspace-member-role.vo';

@InputType()
export class InviteWorkspaceMemberInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field(() => WorkspaceMemberRole)
  @IsEnum(WorkspaceMemberRole)
  role!: WorkspaceMemberRole;
}
