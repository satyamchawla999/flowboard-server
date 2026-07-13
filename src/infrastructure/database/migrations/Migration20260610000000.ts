import { Migration } from '@mikro-orm/migrations';

export class Migration20260610000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "workspace_user_profiles" ("user_id" uuid not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "account_status" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workspace_user_profiles_pkey" primary key ("user_id"));`,
    );
    this.addSql(
      `alter table "workspace_user_profiles" add constraint "workspace_user_profiles_email_unique" unique ("email");`,
    );
    this.addSql(
      `create index "workspace_user_profiles_email_index" on "workspace_user_profiles" ("email");`,
    );
    this.addSql(
      `insert into "workspace_user_profiles" ("user_id", "email", "display_name", "account_status", "created_at", "updated_at") select "id", lower("email"), "display_name", "account_status", "created_at", "updated_at" from "users" on conflict ("user_id") do update set "email" = excluded."email", "display_name" = excluded."display_name", "account_status" = excluded."account_status", "updated_at" = excluded."updated_at";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "workspace_user_profiles" cascade;`);
  }
}
