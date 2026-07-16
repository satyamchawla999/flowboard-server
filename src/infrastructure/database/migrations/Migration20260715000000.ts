import { Migration } from '@mikro-orm/migrations';

export class Migration20260715000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "inbox_messages" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "message_id" varchar(255) not null, "handler_name" varchar(255) not null, "event_name" varchar(255) not null, "workspace_id" uuid null, "payload" jsonb not null default '{}', "headers" jsonb not null default '{}', "status" text check ("status" in ('PROCESSING', 'PROCESSED', 'FAILED')) not null default 'PROCESSING', "attempt_count" int not null default 0, "next_attempt_at" timestamptz null, "locked_at" timestamptz null, "locked_by" varchar(255) null, "last_error" text null, "processed_at" timestamptz null, constraint "inbox_messages_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "inbox_messages" add constraint "inbox_messages_message_id_handler_name_unique" unique ("message_id", "handler_name");`,
    );
    this.addSql(
      `create index "inbox_messages_status_next_attempt_at_index" on "inbox_messages" ("status", "next_attempt_at");`,
    );
    this.addSql(`create index "inbox_messages_locked_at_index" on "inbox_messages" ("locked_at");`);
    this.addSql(
      `create index "inbox_messages_message_id_index" on "inbox_messages" ("message_id");`,
    );
    this.addSql(
      `create index "inbox_messages_handler_name_index" on "inbox_messages" ("handler_name");`,
    );
    this.addSql(
      `create index "inbox_messages_event_name_index" on "inbox_messages" ("event_name");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "inbox_messages" cascade;`);
  }
}
