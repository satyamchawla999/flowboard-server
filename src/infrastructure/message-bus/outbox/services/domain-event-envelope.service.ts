import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DomainEventEnvelope } from '../domain/domain-event-envelope';

type DomainEventLike = Record<string, unknown> & {
  constructor: { EVENT_NAME?: string };
};

@Injectable()
export class DomainEventEnvelopeService {
  toEnvelope(event: object): DomainEventEnvelope | null {
    const eventName = (event.constructor as { EVENT_NAME?: string }).EVENT_NAME;
    if (!eventName) return null;

    const eventRecord = event as DomainEventLike;
    const payload = this.toJsonRecord(eventRecord);
    const aggregate = this.resolveAggregate(payload, eventName);
    const occurredAt = this.resolveDate(payload.occurredAt ?? payload.firedAt ?? payload.fired_at);
    const eventId =
      this.stringValue(payload.eventId) ??
      this.stringValue(payload.messageId) ??
      this.stringValue(payload.id) ??
      uuidv4();

    return {
      eventId,
      eventName,
      occurredAt,
      aggregateId: aggregate.aggregateId,
      aggregateType: aggregate.aggregateType,
      workspaceId: this.resolveWorkspaceId(payload, aggregate),
      payload,
      headers: {
        eventId,
        eventName,
        aggregateId: aggregate.aggregateId,
        aggregateType: aggregate.aggregateType,
        contentType: 'application/json',
      },
    };
  }

  private toJsonRecord(event: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(
      JSON.stringify(event, (_key, value: unknown) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      }),
    ) as Record<string, unknown>;
  }

  private resolveAggregate(
    payload: Record<string, unknown>,
    eventName: string,
  ): { aggregateId: string; aggregateType: string } {
    const candidates: Array<[string, string]> = [
      ['taskId', 'TASK'],
      ['sectionId', 'PROJECT_SECTION'],
      ['projectId', 'PROJECT'],
      ['workspaceId', 'WORKSPACE'],
      ['userId', 'USER'],
      ['sessionId', 'SESSION'],
    ];

    for (const [key, aggregateType] of candidates) {
      const value = this.stringValue(payload[key]);
      if (value) return { aggregateId: value, aggregateType };
    }

    return {
      aggregateId: uuidv4(),
      aggregateType: eventName.split('.')[0]?.toUpperCase() || 'UNKNOWN',
    };
  }

  private resolveWorkspaceId(
    payload: Record<string, unknown>,
    aggregate: { aggregateId: string; aggregateType: string },
  ): string | null {
    const workspaceId = this.stringValue(payload.workspaceId);
    if (workspaceId) return workspaceId;
    if (aggregate.aggregateType === 'WORKSPACE') return aggregate.aggregateId;
    return null;
  }

  private resolveDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return new Date();
  }

  private stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }
}
