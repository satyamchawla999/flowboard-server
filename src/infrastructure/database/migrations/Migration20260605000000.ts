import { Migration } from '@mikro-orm/migrations';

export class Migration20260605000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "workspace_members" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workspace_id" uuid not null, "user_id" uuid not null, "role" text check ("role" in ('OWNER', 'ADMIN', 'MEMBER')) not null default 'MEMBER', "joined_at" timestamptz not null, constraint "workspace_members_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "workspace_members" add constraint "workspace_members_workspace_id_user_id_unique" unique ("workspace_id", "user_id");`,
    );
    this.addSql(
      `create index "workspace_members_workspace_id_index" on "workspace_members" ("workspace_id");`,
    );
    this.addSql(
      `create index "workspace_members_user_id_index" on "workspace_members" ("user_id");`,
    );

    this.addSql(
      `create table "workspace_invitations" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workspace_id" uuid not null, "email" varchar(255) not null, "role" text check ("role" in ('OWNER', 'ADMIN', 'MEMBER')) not null default 'MEMBER', "invited_by_user_id" uuid not null, "status" text check ("status" in ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED')) not null default 'PENDING', "token" text not null, "expires_at" timestamptz not null, "accepted_at" timestamptz null, "rejected_at" timestamptz null, constraint "workspace_invitations_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "workspace_invitations" add constraint "workspace_invitations_token_unique" unique ("token");`,
    );
    this.addSql(
      `create index "workspace_invitations_workspace_id_index" on "workspace_invitations" ("workspace_id");`,
    );
    this.addSql(
      `create index "workspace_invitations_token_index" on "workspace_invitations" ("token");`,
    );
    this.addSql(
      `create index "workspace_invitations_status_index" on "workspace_invitations" ("status");`,
    );
    this.addSql(
      `create index "workspace_invitations_workspace_id_email_status_index" on "workspace_invitations" ("workspace_id", "email", "status");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "workspace_invitations" cascade;`);
    this.addSql(`drop table if exists "workspace_members" cascade;`);
  }
}
