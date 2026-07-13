import { Migration } from '@mikro-orm/migrations';

export class Migration20260713003000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "activities" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "event_id" varchar(255) null, "workspace_id" uuid not null, "project_id" uuid null, "task_id" uuid null, "section_id" uuid null, "actor_user_id" uuid null, "type" text check ("type" in ('PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_HEALTH_CHANGED', 'PROJECT_DATES_CHANGED', 'PROJECT_ARCHIVED', 'PROJECT_RESTORED', 'PROJECT_DELETED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'PROJECT_OWNERSHIP_TRANSFERRED', 'PROJECT_SECTION_CREATED', 'PROJECT_SECTION_RENAMED', 'PROJECT_SECTION_REORDERED', 'PROJECT_SECTION_DELETED', 'PROJECT_SECTION_RESTORED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_PRIORITY_CHANGED', 'TASK_DUE_DATE_CHANGED', 'TASK_COMPLETED', 'TASK_REOPENED', 'TASK_MOVED', 'TASK_REORDERED', 'TASK_DELETED')) not null, "subject_type" text check ("subject_type" in ('PROJECT', 'PROJECT_SECTION', 'TASK')) not null, "subject_id" uuid not null, "metadata" jsonb not null default '{}', "occurred_at" timestamptz not null, constraint "activities_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "activities" add constraint "activities_event_id_unique" unique ("event_id");`,
    );
    this.addSql(
      `create index "activities_workspace_id_occurred_at_index" on "activities" ("workspace_id", "occurred_at");`,
    );
    this.addSql(
      `create index "activities_project_id_occurred_at_index" on "activities" ("project_id", "occurred_at");`,
    );
    this.addSql(
      `create index "activities_task_id_occurred_at_index" on "activities" ("task_id", "occurred_at");`,
    );
    this.addSql(`create index "activities_actor_user_id_index" on "activities" ("actor_user_id");`);
    this.addSql(`create index "activities_type_index" on "activities" ("type");`);
    this.addSql(
      `create index "activities_subject_type_subject_id_index" on "activities" ("subject_type", "subject_id");`,
    );
    this.addSql(`create index "activities_occurred_at_index" on "activities" ("occurred_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "activities" cascade;`);
  }
}
