import { Migration } from '@mikro-orm/migrations';

export class Migration20260609000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "membership_user_profiles" ("user_id" uuid not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "membership_user_profiles_pkey" primary key ("user_id"));`,
    );
    this.addSql(
      `alter table "membership_user_profiles" add constraint "membership_user_profiles_email_unique" unique ("email");`,
    );
    this.addSql(
      `create index "membership_user_profiles_email_index" on "membership_user_profiles" ("email");`,
    );
    this.addSql(
      `insert into "membership_user_profiles" ("user_id", "email", "display_name", "created_at", "updated_at") select "id", lower("email"), "display_name", "created_at", "updated_at" from "users" on conflict ("user_id") do update set "email" = excluded."email", "display_name" = excluded."display_name", "updated_at" = excluded."updated_at";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "membership_user_profiles" cascade;`);
  }
}
