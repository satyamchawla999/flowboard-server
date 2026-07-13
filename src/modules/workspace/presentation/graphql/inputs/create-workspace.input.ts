import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  logo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;
}
