# FlowBoard Module Development Context

Use this document as context for further backend development. The current source of truth is the Identity, Workspace, and Membership modules. The Task module exists, but it should be treated as draft code, not the final architecture for future Task, Project, or Activity work.

## Architecture Style

FlowBoard uses a modular DDD-inspired NestJS architecture:

- `domain/`: framework-independent business models, value objects, events, errors, and repository contracts.
- `features/<use-case>/`: one application use case per folder. Each feature has a handler and, when needed, a colocated DTO.
- `infrastructure/`: technical services, auth, email, projections, persistence entities, mappers, and repository implementations.
- `presentation/graphql/`: GraphQL inputs, models, and resolvers.
- `<module>.module.ts`: Nest provider wiring only.

Resolvers should stay thin. They should:

- receive GraphQL input,
- call a feature handler directly,
- map domain models to GraphQL models.

Handlers own the use-case flow. They should:

- load aggregates/read models through repository contracts,
- enforce use-case-level rules,
- call domain model methods,
- save through repositories,
- dispatch domain events when needed.

Domain models should stay independent from NestJS, GraphQL, MikroORM, and HTTP concerns.

## Identity Module

Identity is the baseline module for style and structure.

Key paths:

- `src/modules/identity/features/*`
- `src/modules/identity/domain/*`
- `src/modules/identity/contracts/auth-payload.dto.ts`
- `src/modules/identity/infrastructure/services/*`
- `src/modules/identity/infrastructure/presentation/graphql/resolvers/*`

Current capabilities:

- signup
- login
- refresh token
- logout
- logout all devices
- change password
- forgot password
- reset password
- send verification email
- verify email
- get current user
- update profile
- list active sessions
- revoke session

Important identity concepts:

- `User` aggregate owns account data, password hash, profile fields, account status, and user domain events.
- `Session` model tracks refresh-token based sessions.
- `AccountStatus` controls user lifecycle states.
- `AuthTokenIssuerService` centralizes session creation, refresh token hashing, token issuance, and refresh-token rotation.
- `PasswordHasherService` owns password hashing and comparison.
- `DomainEventDispatcherService` dispatches domain events pulled from aggregates.

Identity emits events that other modules project locally:

- `identity.user.registered`
- `identity.user.profile_updated`
- `identity.user.password_changed`
- `identity.user.logged_in`

Future modules should not directly depend on identity internals for user data. Instead, use local projections where needed.

## Workspace Module

Workspace is now feature-based and has no `application` folder.

Key paths:

- `src/modules/workspace/features/*`
- `src/modules/workspace/domain/*`
- `src/modules/workspace/infrastructure/services/*`
- `src/modules/workspace/infrastructure/persistence/mikro-orm/*`
- `src/modules/workspace/presentation/graphql/*`

Current features:

- `create-workspace`
- `get-workspace`
- `list-my-workspaces`
- `update-workspace`
- `update-workspace-preferences`
- `archive-workspace`
- `restore-workspace`
- `delete-workspace`

Domain concepts:

- `Workspace` aggregate owns name, slug, owner id, description, logo, timezone, archive/delete lifecycle, and preferences.
- `WorkspacePreferences` value object owns default task view, timezone, notification settings, automation rules, and custom statuses.
- Workspace domain events include:
  - `WorkspaceCreatedEvent`
  - `WorkspaceUpdatedEvent`
  - `WorkspaceArchivedEvent`

Infrastructure services:

- `WorkspaceAccessService`: loads a workspace and enforces owner access.
- `WorkspaceDomainEventDispatcherService`: dispatches workspace aggregate events.
- `WorkspaceUserProfileProjectionService`: listens to identity user events and maintains a local workspace user profile projection.

Important rule:

- Current workspace access is owner-based. Membership-aware access can be added later when Project/Task/Activity needs workspace member permissions.

## Membership Module

Membership is now feature-based and has no `application` folder.

Key paths:

- `src/modules/membership/features/*`
- `src/modules/membership/domain/*`
- `src/modules/membership/infrastructure/services/*`
- `src/modules/membership/infrastructure/persistence/mikro-orm/*`
- `src/modules/membership/presentation/graphql/*`

Current features:

- `invite-workspace-member`
- `accept-workspace-invitation`
- `reject-workspace-invitation`
- `cancel-workspace-invitation`
- `list-workspace-members`
- `list-workspace-invitations`
- `change-workspace-member-role`
- `remove-workspace-member`
- `leave-workspace`
- `transfer-workspace-ownership`
- `handle-workspace-created`

Domain concepts:

- `WorkspaceMember` model owns workspace id, user id, role, and joined date.
- `WorkspaceInvitation` model owns invitation email, role, token, expiry, and invitation status.
- `WorkspaceMemberRole` supports:
  - `OWNER`
  - `ADMIN`
  - `MEMBER`
- `WorkspaceInvitationStatus` supports pending/accepted/rejected/cancelled/expired states.

Membership domain events include:

- `MemberInvitedEvent`
- `MemberJoinedEvent`
- `MemberLeftEvent`
- `MemberRemovedEvent`
- `MemberRoleChangedEvent`
- `OwnershipTransferredEvent`

Infrastructure services:

- `MembershipPolicyService`: shared role and permission checks.
- `WorkspaceInvitationAccessService`: validates invitation token, pending state, and expiry.
- `MembershipUserProfileProjectionService`: listens to identity user events and maintains local member user profiles.

Important rules:

- Workspace creator becomes owner through `HandleWorkspaceCreatedHandler`, which listens to `WorkspaceCreatedEvent`.
- Owners can invite admins or members, but not another owner through a normal invite.
- Admins can invite members.
- Only owners can change member roles.
- Ownership transfer promotes the target member to owner and demotes the actor to admin.
- The last owner cannot leave or be removed.
- Invitation accept/reject requires authenticated user email to match the invitation email.

## How To Build Future Modules

For Task, Project, and Activity, follow the same shape:

```text
src/modules/<module>/
  domain/
    contracts/
    errors/
    events/
    models/
    value-objects/
  features/
    create-thing/
      create-thing.dto.ts
      create-thing.handler.ts
    update-thing/
      update-thing.dto.ts
      update-thing.handler.ts
  infrastructure/
    persistence/mikro-orm/
      entities/
      mappers/
      repositories/
    services/
  presentation/graphql/
    inputs/
    models/
    resolvers/
  <module>.module.ts
```

Do not create an `application` folder for new modules.

Use these conventions:

- Put feature-specific DTOs beside the handler.
- Put shared cross-feature DTOs in `src/modules/<module>/contracts`.
- Put reusable technical/helper services in `infrastructure/services`.
- Put repository interfaces in `domain/contracts`.
- Put GraphQL input classes in `presentation/graphql/inputs`.
- Keep GraphQL models separate from domain models.
- Prefer domain methods over mutating domain fields directly.
- Emit domain events from aggregates when state changes matter to other modules.
- Use local projections instead of importing another module's domain model directly.

## Guidance For Project Module

Project should probably belong to a workspace.

Likely aggregate:

- `Project`

Likely fields:

- `id`
- `workspaceId`
- `name`
- `slug` or `key`
- `description`
- `status`
- `ownerId` or `createdByUserId`
- `startDate`
- `dueDate`
- `createdAt`
- `updatedAt`
- `isArchived`
- `isDeleted`

Likely features:

- create project
- get project
- list workspace projects
- update project
- archive project
- restore project
- delete project

Permission suggestion:

- Use membership rules, not workspace ownership only.
- Owners/admins can create/update/archive/delete projects.
- Members can read projects and maybe create tasks depending on product rules.

## Guidance For Task Module

Current task code exists but should be treated as draft.

Recommended task aggregate:

- `Task`

Likely fields:

- `id`
- `workspaceId`
- `projectId`
- `title`
- `description`
- `status`
- `priority`
- `assigneeUserId`
- `reporterUserId`
- `dueDate`
- `position`
- `createdAt`
- `updatedAt`
- `completedAt`
- `isDeleted`

Likely value objects:

- `TaskStatus`
- `TaskPriority`

Likely features:

- create task
- get task
- list project tasks
- list my assigned tasks
- update task
- change task status
- assign task
- reorder task
- delete task

Permission suggestion:

- Any workspace member can read tasks.
- Owners/admins can manage all tasks.
- Members can create tasks and update tasks they created or are assigned to, if product rules allow it.

## Guidance For Activity Module

Activity should likely be event/projection based rather than a heavy aggregate.

Purpose:

- track important workspace/project/task/member actions.
- provide audit trail and timeline feeds.

Likely read model:

- `Activity`

Likely fields:

- `id`
- `workspaceId`
- `projectId`
- `taskId`
- `actorUserId`
- `type`
- `message`
- `metadata`
- `createdAt`

Likely features:

- list workspace activity
- list project activity
- list task activity

Event sources:

- workspace created/updated/archived
- member invited/joined/removed/role changed
- project created/updated/archived
- task created/updated/status changed/assigned/deleted

Implementation suggestion:

- Create activity records from event listeners in `infrastructure/services`.
- Keep activity append-only.
- Avoid letting normal users manually create activity records.

## Prompt To Give ChatGPT

You can paste this with the repo context:

```text
We are developing FlowBoard backend in NestJS, GraphQL, MikroORM, and PostgreSQL.

Use the existing Identity, Workspace, and Membership modules as the architecture baseline.

Important rules:
- No application folder for new modules.
- Use feature-based handlers under features/<use-case>.
- Feature-specific DTOs live beside handlers.
- Shared contracts live in module/contracts.
- Domain stays framework-independent.
- Repository interfaces live in domain/contracts.
- MikroORM entities/mappers/repositories live in infrastructure/persistence/mikro-orm.
- Shared technical services and event projection services live in infrastructure/services.
- GraphQL resolvers are thin and call handlers directly.
- Do not use the current Task module as final architecture; it is draft code only.

Build Project, Task, and Activity modules using this style and integrate permissions with Membership.
```
