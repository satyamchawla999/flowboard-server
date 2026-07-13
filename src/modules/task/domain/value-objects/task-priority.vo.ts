import { BaseValueObject } from '@common/base';

export enum TaskPriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

interface TaskPriorityProps {
  value: TaskPriorityLevel;
}

/**
 * TaskPriority is a value object — it has no identity, only meaning.
 * Two MEDIUM priorities are semantically identical regardless of instance.
 */
export class TaskPriority extends BaseValueObject<TaskPriorityProps> {
  static readonly LOW = new TaskPriority({ value: TaskPriorityLevel.LOW });
  static readonly MEDIUM = new TaskPriority({ value: TaskPriorityLevel.MEDIUM });
  static readonly HIGH = new TaskPriority({ value: TaskPriorityLevel.HIGH });
  static readonly URGENT = new TaskPriority({ value: TaskPriorityLevel.URGENT });

  private constructor(props: TaskPriorityProps) {
    super(props);
  }

  static from(value: string): TaskPriority {
    const level = Object.values(TaskPriorityLevel).find((l) => l === value);
    if (!level) {
      throw new Error(`Invalid task priority: ${value}`);
    }
    return new TaskPriority({ value: level });
  }

  get value(): TaskPriorityLevel {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
