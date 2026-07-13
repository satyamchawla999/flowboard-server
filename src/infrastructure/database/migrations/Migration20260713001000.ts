import { Migration } from '@mikro-orm/migrations';

export class Migration20260713001000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "project_sections" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workspace_id" uuid not null, "project_id" uuid not null, "name" varchar(255) not null, "position" numeric(20,6) not null, "deleted_at" timestamptz null, constraint "project_sections_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "project_sections_workspace_id_index" on "project_sections" ("workspace_id");`,
    );
    this.addSql(
      `create index "project_sections_project_id_index" on "project_sections" ("project_id");`,
    );
    this.addSql(
      `create index "project_sections_project_id_position_index" on "project_sections" ("project_id", "position");`,
    );
    this.addSql(
      `create index "project_sections_deleted_at_index" on "project_sections" ("deleted_at");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "project_sections" cascade;`);
  }
}
