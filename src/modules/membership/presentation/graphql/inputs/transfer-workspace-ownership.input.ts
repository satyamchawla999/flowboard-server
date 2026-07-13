import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class TransferWorkspaceOwnershipInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field(() => ID)
  @IsUUID()
  targetUserId!: string;
}
