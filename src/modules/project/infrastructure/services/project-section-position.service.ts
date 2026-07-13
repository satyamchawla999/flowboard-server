import { Injectable } from '@nestjs/common';
import { ProjectSection } from '../../domain/models/project-section.model';
import { InvalidProjectSectionPositionError } from '../../domain/errors/project-section.errors';

const POSITION_GAP = 1000;
const MIN_POSITION_GAP = 0.0001;

@Injectable()
export class ProjectSectionPositionService {
  appendAfter(lastSection: ProjectSection | null): number {
    return lastSection ? lastSection.position + POSITION_GAP : POSITION_GAP;
  }

  between(previous: ProjectSection | null, next: ProjectSection | null): number {
    if (previous && next && previous.position >= next.position) {
      throw new InvalidProjectSectionPositionError('Previous section must be before next section');
    }

    if (previous && next) {
      const gap = next.position - previous.position;
      if (gap <= MIN_POSITION_GAP) {
        throw new InvalidProjectSectionPositionError('Project section positions need rebalancing');
      }
      return previous.position + gap / 2;
    }

    if (previous) return previous.position + POSITION_GAP;
    if (next) return Math.max(next.position / 2, MIN_POSITION_GAP);
    return POSITION_GAP;
  }

  needsRebalance(previous: ProjectSection | null, next: ProjectSection | null): boolean {
    return Boolean(previous && next && next.position - previous.position <= MIN_POSITION_GAP);
  }

  rebalance(sections: ProjectSection[]): void {
    sections
      .filter((section) => !section.isDeleted)
      .sort((left, right) => left.position - right.position)
      .forEach((section, index) => {
        section.moveTo((index + 1) * POSITION_GAP, 'system');
        section.pullDomainEvents();
      });
  }
}
