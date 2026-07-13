import { BaseValueObject } from '@common/base';

export enum TaskLifecycleStatusValue {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
}

interface TaskLifecycleStatusProps {
  value: TaskLifecycleStatusValue;
}

export class TaskLifecycleStatus extends BaseValueObject<TaskLifecycleStatusProps> {
  static readonly OPEN = new TaskLifecycleStatus({ value: TaskLifecycleStatusValue.OPEN });
  static readonly COMPLETED = new TaskLifecycleStatus({
    value: TaskLifecycleStatusValue.COMPLETED,
  });

  private constructor(props: TaskLifecycleStatusProps) {
    super(props);
  }

  static from(value: string): TaskLifecycleStatus {
    const status = Object.values(TaskLifecycleStatusValue).find((candidate) => candidate === value);
    if (!status) throw new Error(`Invalid Task lifecycle status: ${value}`);
    return new TaskLifecycleStatus({ value: status });
  }

  get value(): TaskLifecycleStatusValue {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
