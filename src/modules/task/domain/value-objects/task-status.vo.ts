import { BaseValueObject } from '@common/base';
import { InvalidOperationError } from '@common/errors';

export enum TaskStatusValue {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

interface TaskStatusProps {
  value: TaskStatusValue;
}

const ALLOWED_TRANSITIONS: Record<TaskStatusValue, TaskStatusValue[]> = {
  [TaskStatusValue.TODO]: [TaskStatusValue.IN_PROGRESS],
  [TaskStatusValue.IN_PROGRESS]: [TaskStatusValue.IN_REVIEW, TaskStatusValue.TODO],
  [TaskStatusValue.IN_REVIEW]: [TaskStatusValue.DONE, TaskStatusValue.IN_PROGRESS],
  [TaskStatusValue.DONE]: [],
};

/**
 * Encodes the legal state machine transitions for a task.
 * Domain rule lives here — not in the service, not in the resolver.
 */
export class TaskStatus extends BaseValueObject<TaskStatusProps> {
  static readonly TODO = new TaskStatus({ value: TaskStatusValue.TODO });
  static readonly IN_PROGRESS = new TaskStatus({ value: TaskStatusValue.IN_PROGRESS });
  static readonly IN_REVIEW = new TaskStatus({ value: TaskStatusValue.IN_REVIEW });
  static readonly DONE = new TaskStatus({ value: TaskStatusValue.DONE });

  private constructor(props: TaskStatusProps) {
    super(props);
  }

  static from(value: string): TaskStatus {
    const status = Object.values(TaskStatusValue).find((s) => s === value);
    if (!status) throw new Error(`Invalid task status: ${value}`);
    return new TaskStatus({ value: status });
  }

  transitionTo(next: TaskStatus): TaskStatus {
    const allowed = ALLOWED_TRANSITIONS[this.props.value];
    if (!allowed.includes(next.props.value)) {
      throw new InvalidOperationError(
        `Cannot transition task from ${this.props.value} to ${next.props.value}`,
      );
    }
    return next;
  }

  get value(): TaskStatusValue {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
