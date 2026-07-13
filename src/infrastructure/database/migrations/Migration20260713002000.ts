import { Migration } from '@mikro-orm/migrations';

export class Migration20260713002000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "tasks" add column "workspace_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "section_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "parent_task_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "assignee_user_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "reporter_user_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "lifecycle_status" text null;`);
    this.addSql(`alter table "tasks" add column "due_date" timestamptz null;`);
    this.addSql(`alter table "tasks" add column "position" numeric(20,6) null;`);
    this.addSql(`alter table "tasks" add column "completed_at" timestamptz null;`);
    this.addSql(`alter table "tasks" add column "deleted_at" timestamptz null;`);

    this.addSql(
      `update "tasks" t set "workspace_id" = p."workspace_id" from "projects" p where p."id" = t."project_id";`,
    );
    this.addSql(
      `update "tasks" t set "section_id" = (select ps."id" from "project_sections" ps where ps."project_id" = t."project_id" and ps."deleted_at" is null order by ps."position" asc limit 1);`,
    );
    this.addSql(`update "tasks" set "assignee_user_id" = "assignee_id";`);
    this.addSql(`update "tasks" set "reporter_user_id" = "created_by_id";`);
    this.addSql(
      `update "tasks" set "lifecycle_status" = case when "status" = 'DONE' then 'COMPLETED' else 'OPEN' end;`,
    );
    this.addSql(`update "tasks" set "priority" = coalesce("priority", 'NONE');`);
    this.addSql(
      `with ordered as (select "id", row_number() over (partition by "project_id", "section_id" order by "created_at", "id") as rn from "tasks") update "tasks" t set "position" = ordered.rn * 1000 from ordered where ordered."id" = t."id";`,
    );
    this.addSql(
      `update "tasks" set "completed_at" = "updated_at" where "lifecycle_status" = 'COMPLETED' and "completed_at" is null;`,
    );
    this.addSql(
      `do $$ begin if exists (select 1 from "tasks" where "workspace_id" is null or "section_id" is null or "reporter_user_id" is null or "position" is null) then raise exception 'Cannot migrate draft tasks: every row must map to a project workspace and active project section'; end if; end $$;`,
    );

    this.addSql(`alter table "tasks" alter column "workspace_id" set not null;`);
    this.addSql(`alter table "tasks" alter column "section_id" set not null;`);
    this.addSql(`alter table "tasks" alter column "reporter_user_id" set not null;`);
    this.addSql(`alter table "tasks" alter column "lifecycle_status" set not null;`);
    this.addSql(`alter table "tasks" alter column "lifecycle_status" set default 'OPEN';`);
    this.addSql(`alter table "tasks" alter column "position" set not null;`);
    this.addSql(`alter table "tasks" alter column "priority" set default 'NONE';`);
    this.addSql(`alter table "tasks" drop constraint if exists "tasks_priority_check";`);
    this.addSql(
      `alter table "tasks" add constraint "tasks_priority_check" check ("priority" in ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'));`,
    );
    this.addSql(
      `alter table "tasks" add constraint "tasks_lifecycle_status_check" check ("lifecycle_status" in ('OPEN', 'COMPLETED'));`,
    );
    this.addSql(`alter table "tasks" drop column "assignee_id";`);
    this.addSql(`alter table "tasks" drop column "created_by_id";`);
    this.addSql(`alter table "tasks" drop column "status";`);

    this.addSql(`create index "tasks_workspace_id_index" on "tasks" ("workspace_id");`);
    this.addSql(`create index "tasks_project_id_index" on "tasks" ("project_id");`);
    this.addSql(`create index "tasks_section_id_index" on "tasks" ("section_id");`);
    this.addSql(
      `create index "tasks_section_id_position_index" on "tasks" ("section_id", "position");`,
    );
    this.addSql(`create index "tasks_assignee_user_id_index" on "tasks" ("assignee_user_id");`);
    this.addSql(`create index "tasks_reporter_user_id_index" on "tasks" ("reporter_user_id");`);
    this.addSql(`create index "tasks_lifecycle_status_index" on "tasks" ("lifecycle_status");`);
    this.addSql(`create index "tasks_due_date_index" on "tasks" ("due_date");`);
    this.addSql(`create index "tasks_deleted_at_index" on "tasks" ("deleted_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "tasks_workspace_id_index";`);
    this.addSql(`drop index if exists "tasks_project_id_index";`);
    this.addSql(`drop index if exists "tasks_section_id_index";`);
    this.addSql(`drop index if exists "tasks_section_id_position_index";`);
    this.addSql(`drop index if exists "tasks_assignee_user_id_index";`);
    this.addSql(`drop index if exists "tasks_reporter_user_id_index";`);
    this.addSql(`drop index if exists "tasks_lifecycle_status_index";`);
    this.addSql(`drop index if exists "tasks_due_date_index";`);
    this.addSql(`drop index if exists "tasks_deleted_at_index";`);
    this.addSql(`alter table "tasks" add column "assignee_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "created_by_id" uuid null;`);
    this.addSql(`alter table "tasks" add column "status" text not null default 'TODO';`);
    this.addSql(`update "tasks" set "assignee_id" = "assignee_user_id";`);
    this.addSql(`update "tasks" set "created_by_id" = "reporter_user_id";`);
    this.addSql(
      `update "tasks" set "status" = case when "lifecycle_status" = 'COMPLETED' then 'DONE' else 'TODO' end;`,
    );
    this.addSql(`alter table "tasks" drop constraint if exists "tasks_lifecycle_status_check";`);
    this.addSql(`alter table "tasks" drop constraint if exists "tasks_priority_check";`);
    this.addSql(
      `alter table "tasks" add constraint "tasks_priority_check" check ("priority" in ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));`,
    );
    this.addSql(`alter table "tasks" drop column "workspace_id";`);
    this.addSql(`alter table "tasks" drop column "section_id";`);
    this.addSql(`alter table "tasks" drop column "parent_task_id";`);
    this.addSql(`alter table "tasks" drop column "assignee_user_id";`);
    this.addSql(`alter table "tasks" drop column "reporter_user_id";`);
    this.addSql(`alter table "tasks" drop column "lifecycle_status";`);
    this.addSql(`alter table "tasks" drop column "due_date";`);
    this.addSql(`alter table "tasks" drop column "position";`);
    this.addSql(`alter table "tasks" drop column "completed_at";`);
    this.addSql(`alter table "tasks" drop column "deleted_at";`);
  }
}
