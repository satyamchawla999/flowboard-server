export interface DomainEventEnvelope {
  eventId: string;
  eventName: string;
  occurredAt: Date;
  aggregateId: string;
  aggregateType: string;
  workspaceId: string | null;
  payload: Record<string, unknown>;
  headers: Record<string, unknown>;
}
