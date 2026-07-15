import { Migration } from '@mikro-orm/migrations';

export class Migration20260714000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "outbox_messages" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "event_id" uuid not null, "event_name" varchar(255) not null, "occurred_at" timestamptz not null, "aggregate_id" uuid not null, "aggregate_type" varchar(255) not null, "workspace_id" uuid null, "payload" jsonb not null default '{}', "headers" jsonb not null default '{}', "status" text check ("status" in ('PENDING', 'PUBLISHED', 'FAILED')) not null default 'PENDING', "attempt_count" int not null default 0, "next_attempt_at" timestamptz null, "locked_at" timestamptz null, "locked_by" varchar(255) null, "last_error" text null, "published_at" timestamptz null, constraint "outbox_messages_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "outbox_messages" add constraint "outbox_messages_event_id_unique" unique ("event_id");`,
    );
    this.addSql(
      `create index "outbox_messages_status_next_attempt_at_index" on "outbox_messages" ("status", "next_attempt_at");`,
    );
    this.addSql(
      `create index "outbox_messages_locked_at_index" on "outbox_messages" ("locked_at");`,
    );
    this.addSql(
      `create index "outbox_messages_workspace_id_index" on "outbox_messages" ("workspace_id");`,
    );
    this.addSql(
      `create index "outbox_messages_aggregate_type_aggregate_id_index" on "outbox_messages" ("aggregate_type", "aggregate_id");`,
    );
    this.addSql(
      `create index "outbox_messages_event_name_index" on "outbox_messages" ("event_name");`,
    );
    this.addSql(
      `create index "outbox_messages_occurred_at_index" on "outbox_messages" ("occurred_at");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "outbox_messages" cascade;`);
  }
}
