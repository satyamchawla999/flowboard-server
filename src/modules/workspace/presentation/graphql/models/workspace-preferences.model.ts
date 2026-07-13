import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { TaskView } from '../../../domain/value-objects/workspace-preferences.vo';

registerEnumType(TaskView, { name: 'TaskView' });

@ObjectType('WorkspacePreferences')
export class WorkspacePreferencesGqlModel {
  @Field(() => TaskView)
  defaultTaskView!: TaskView;

  @Field()
  defaultTimezone!: string;

  @Field({ nullable: true })
  notificationSettings?: string;

  @Field({ nullable: true })
  automationRules?: string;

  @Field({ nullable: true })
  customStatuses?: string;
}
