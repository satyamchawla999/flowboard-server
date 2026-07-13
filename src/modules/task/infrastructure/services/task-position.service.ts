import { Injectable } from '@nestjs/common';
import { Task } from '../../domain/models/task.model';
import { TaskPositionInvalidError } from '../../domain/errors/task.errors';

const POSITION_GAP = 1000;
const MIN_POSITION_GAP = 0.0001;

@Injectable()
export class TaskPositionService {
  appendAfter(lastTask: Task | null): number {
    return lastTask ? lastTask.position + POSITION_GAP : POSITION_GAP;
  }

  between(previous: Task | null, next: Task | null): number {
    if (previous && next && previous.position >= next.position) {
      throw new TaskPositionInvalidError('Previous task must be before next task');
    }

    if (previous && next) {
      const gap = next.position - previous.position;
      if (gap <= MIN_POSITION_GAP) {
        throw new TaskPositionInvalidError('Task positions need rebalancing');
      }
      return previous.position + gap / 2;
    }

    if (previous) return previous.position + POSITION_GAP;
    if (next) return Math.max(next.position / 2, MIN_POSITION_GAP);
    return POSITION_GAP;
  }

  needsRebalance(previous: Task | null, next: Task | null): boolean {
    return Boolean(previous && next && next.position - previous.position <= MIN_POSITION_GAP);
  }

  rebalance(tasks: Task[]): void {
    tasks
      .filter((task) => !task.isDeleted)
      .sort((left, right) => left.position - right.position)
      .forEach((task, index) => {
        task.reorder((index + 1) * POSITION_GAP, 'system');
        task.pullDomainEvents();
      });
  }
}
