import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  dueDate?: Date | null;
}
