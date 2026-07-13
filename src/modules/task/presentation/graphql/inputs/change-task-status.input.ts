import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum } from 'class-validator';
import { TaskStatusValue } from '../../../domain/value-objects/task-status.vo';

@InputType()
export class ChangeTaskStatusInput {
  @Field(() => ID)
  @IsUUID()
  taskId!: string;

  @Field(() => TaskStatusValue)
  @IsEnum(TaskStatusValue)
  newStatus!: TaskStatusValue;
}
