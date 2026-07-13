import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { JsonScalar } from '@common/scalars/json.scalar';
import { ActivityMetadata } from '../../../domain/models/activity.model';
import { ActivitySubjectType } from '../../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../../domain/value-objects/activity-type.vo';

registerEnumType(ActivityType, { name: 'ActivityType' });
registerEnumType(ActivitySubjectType, { name: 'ActivitySubjectType' });

@ObjectType('ActivityActor')
export class ActivityActorGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  displayName!: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType('Activity')
export class ActivityGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID, { nullable: true })
  projectId?: string;

  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => ID, { nullable: true })
  sectionId?: string;

  @Field(() => ActivityType)
  type!: ActivityType;

  @Field(() => ActivitySubjectType)
  subjectType!: ActivitySubjectType;

  @Field(() => ID)
  subjectId!: string;

  @Field(() => JsonScalar)
  metadata!: ActivityMetadata;

  @Field()
  occurredAt!: Date;

  @Field(() => ActivityActorGqlModel, { nullable: true })
  actor?: ActivityActorGqlModel;
}

@ObjectType('ActivityEdge')
export class ActivityEdgeGqlModel {
  @Field()
  cursor!: string;

  @Field(() => ActivityGqlModel)
  node!: ActivityGqlModel;
}

@ObjectType('ActivityPageInfo')
export class ActivityPageInfoGqlModel {
  @Field()
  hasNextPage!: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType('ActivityConnection')
export class ActivityConnectionGqlModel {
  @Field(() => [ActivityEdgeGqlModel])
  edges!: ActivityEdgeGqlModel[];

  @Field(() => ActivityPageInfoGqlModel)
  pageInfo!: ActivityPageInfoGqlModel;
}
