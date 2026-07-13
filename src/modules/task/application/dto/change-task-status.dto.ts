import { IsUUID, IsEnum } from 'class-validator';
import { TaskStatusValue } from '../../domain/value-objects/task-status.vo';

export class ChangeTaskStatusDto {
  @IsUUID()
  taskId!: string;

  @IsEnum(TaskStatusValue)
  newStatus!: TaskStatusValue;

  @IsUUID()
  changedById!: string;
}
