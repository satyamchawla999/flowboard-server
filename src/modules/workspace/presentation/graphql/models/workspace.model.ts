import { ObjectType, Field, ID } from '@nestjs/graphql';
import { WorkspacePreferencesGqlModel } from './workspace-preferences.model';

@ObjectType('Workspace')
export class WorkspaceGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  timezone!: string;

  @Field(() => ID)
  ownerId!: string;

  @Field()
  isArchived!: boolean;

  @Field(() => WorkspacePreferencesGqlModel)
  preferences!: WorkspacePreferencesGqlModel;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
