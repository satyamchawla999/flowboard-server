import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectSectionGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID)
  projectId!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  position!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
