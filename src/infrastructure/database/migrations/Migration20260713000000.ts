import { Migration } from '@mikro-orm/migrations';

export class Migration20260713000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "projects" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workspace_id" uuid not null, "name" varchar(255) not null, "key" varchar(255) not null, "description" text null, "owner_user_id" uuid not null, "created_by_user_id" uuid not null, "health_status" varchar(255) not null, "status_message" text null, "start_date" timestamptz null, "due_date" timestamptz null, "archived_at" timestamptz null, "deleted_at" timestamptz null, constraint "projects_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "projects" add constraint "projects_workspace_id_key_unique" unique ("workspace_id", "key");`,
    );
    this.addSql(`create index "projects_workspace_id_index" on "projects" ("workspace_id");`);
    this.addSql(`create index "projects_owner_user_id_index" on "projects" ("owner_user_id");`);
    this.addSql(`create index "projects_archived_at_index" on "projects" ("archived_at");`);
    this.addSql(`create index "projects_deleted_at_index" on "projects" ("deleted_at");`);

    this.addSql(
      `create table "project_members" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workspace_id" uuid not null, "project_id" uuid not null, "user_id" uuid not null, "role" varchar(255) not null, "joined_at" timestamptz not null, constraint "project_members_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "project_members" add constraint "project_members_project_id_user_id_unique" unique ("project_id", "user_id");`,
    );
    this.addSql(
      `create index "project_members_workspace_id_index" on "project_members" ("workspace_id");`,
    );
    this.addSql(
      `create index "project_members_project_id_index" on "project_members" ("project_id");`,
    );
    this.addSql(`create index "project_members_user_id_index" on "project_members" ("user_id");`);
    this.addSql(`create index "project_members_role_index" on "project_members" ("role");`);

    this.addSql(
      `create table "project_user_profiles" ("user_id" uuid not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "project_user_profiles_pkey" primary key ("user_id"));`,
    );
    this.addSql(
      `create index "project_user_profiles_email_index" on "project_user_profiles" ("email");`,
    );
    this.addSql(
      `insert into "project_user_profiles" ("user_id", "email", "display_name", "created_at", "updated_at") select "id", lower("email"), "display_name", "created_at", "updated_at" from "users" on conflict ("user_id") do update set "email" = excluded."email", "display_name" = excluded."display_name", "updated_at" = excluded."updated_at";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "project_members" cascade;`);
    this.addSql(`drop table if exists "projects" cascade;`);
    this.addSql(`drop table if exists "project_user_profiles" cascade;`);
  }
}
