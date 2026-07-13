export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task ${taskId} was not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskTitleInvalidError extends Error {
  constructor() {
    super('Task title must be between 1 and 200 characters');
    this.name = 'TaskTitleInvalidError';
  }
}

export class TaskDeletedError extends Error {
  constructor(taskId: string) {
    super(`Task ${taskId} has been deleted`);
    this.name = 'TaskDeletedError';
  }
}

export class TaskSectionMismatchError extends Error {
  constructor() {
    super('Task placement must stay inside the selected project section');
    this.name = 'TaskSectionMismatchError';
  }
}

export class TaskProjectMismatchError extends Error {
  constructor() {
    super('Task project does not match the selected project or section');
    this.name = 'TaskProjectMismatchError';
  }
}

export class TaskAssigneeNotEligibleError extends Error {
  constructor(userId: string) {
    super(`User ${userId} cannot be assigned to this task`);
    this.name = 'TaskAssigneeNotEligibleError';
  }
}

export class TaskPositionInvalidError extends Error {
  constructor(message = 'Task position is invalid') {
    super(message);
    this.name = 'TaskPositionInvalidError';
  }
}

export class InsufficientTaskPermissionError extends Error {
  constructor() {
    super('You do not have permission to perform this task action');
    this.name = 'InsufficientTaskPermissionError';
  }
}
