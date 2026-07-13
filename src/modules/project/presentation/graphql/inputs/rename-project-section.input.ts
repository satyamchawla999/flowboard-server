import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class RenameProjectSectionInput {
  @Field(() => ID)
  @IsUUID()
  sectionId!: string;

  @Field()
  @IsString()
  @MaxLength(100)
  name!: string;
}
