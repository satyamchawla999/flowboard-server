import { Migration } from '@mikro-orm/migrations';

export class Migration20260521114802 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "sessions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "refresh_token_hash" text not null, "user_agent" text null, "ip_address" varchar(255) null, "expires_at" timestamptz not null, "revoked_at" varchar(255) null, constraint "sessions_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "tasks" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "description" text null, "project_id" uuid not null, "assignee_id" uuid null, "created_by_id" uuid not null, "status" text check ("status" in ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')) not null default 'TODO', "priority" text check ("priority" in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) not null default 'MEDIUM', constraint "tasks_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "timezone" varchar(255) not null default 'UTC', "account_status" text check ("account_status" in ('ACTIVE', 'UNVERIFIED', 'SUSPENDED', 'DELETED')) not null default 'UNVERIFIED', "password_hash" text not null, "password_reset_token" text null, "password_reset_token_expires_at" varchar(255) null, "email_verification_token" text null, "email_verification_token_expires_at" varchar(255) null, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "sessions" cascade;`);

    this.addSql(`drop table if exists "tasks" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);
  }
}
