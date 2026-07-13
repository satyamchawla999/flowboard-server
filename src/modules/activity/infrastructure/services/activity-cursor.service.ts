import { Injectable } from '@nestjs/common';
import { ActivityCursor } from '../../domain/contracts/activity.repository';
import { InvalidActivityCursorError } from '../../domain/errors/activity.errors';
import { Activity } from '../../domain/models/activity.model';

@Injectable()
export class ActivityCursorService {
  encode(activity: Activity): string {
    return Buffer.from(
      JSON.stringify({ occurredAt: activity.occurredAt.toISOString(), id: activity.id }),
      'utf8',
    ).toString('base64url');
  }

  decode(cursor?: string | null): ActivityCursor | undefined {
    if (!cursor) return undefined;
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
        occurredAt?: string;
        id?: string;
      };
      if (!parsed.occurredAt || !parsed.id) throw new InvalidActivityCursorError();
      const occurredAt = new Date(parsed.occurredAt);
      if (Number.isNaN(occurredAt.getTime())) throw new InvalidActivityCursorError();
      return { occurredAt, id: parsed.id };
    } catch {
      throw new InvalidActivityCursorError();
    }
  }
}
