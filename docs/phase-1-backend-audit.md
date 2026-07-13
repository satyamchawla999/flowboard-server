# Phase 1 Backend Audit

Audit date: 2026-07-13

## Scope

Completed backend modules:

- Identity
- Workspace
- Membership
- Project Core and Overview
- Project Sections
- Task
- Project List View
- Activity

Outbox, Inbox, retries, workers, dead-letter handling, notifications, subscriptions, comments, attachments, and frontend work remain out of scope.

## End-To-End Flow

Supported flow:

1. User signup and login through Identity.
2. Workspace creation emits `workspace.created`.
3. Membership handles workspace owner membership from `workspace.created`.
4. Workspace member invitation and acceptance create workspace membership.
5. Project creation creates the Project, Project OWNER membership, and default General section in one transaction.
6. Project members can be added.
7. Tasks can be created, assigned, updated, moved, reordered, completed, reopened, and soft-deleted.
8. Section deletion is blocked when active Tasks exist.
9. Project List View returns active Sections and Tasks in position order.
10. Activity feeds return Workspace, Project, and Task records with cursor pagination.

## Event Coverage Matrix

| Source | Event | Emitted By | Listener | Activity Type | Actor? | Historic Labels? | Event ID? | Projection Test? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project | `project.created` | `CreateProjectHandler` | `ProjectActivityProjectionListener` | `PROJECT_CREATED` | Yes, createdBy | Partial via live Project read | No | No |
| Project | `project.updated` | `UpdateProjectDetailsHandler` | `ProjectActivityProjectionListener` | `PROJECT_UPDATED` | Yes | Partial, no previous/new values | No | No |
| Project | `project.health_changed` | `UpdateProjectHealthHandler` | `ProjectActivityProjectionListener` | `PROJECT_HEALTH_CHANGED` | Yes | Previous/new health in event, message via live read | No | No |
| Project | `project.dates_changed` | `UpdateProjectDatesHandler` | `ProjectActivityProjectionListener` | `PROJECT_DATES_CHANGED` | Yes | Current dates only | No | No |
| Project | `project.archived` | `ArchiveProjectHandler` | `ProjectActivityProjectionListener` | `PROJECT_ARCHIVED` | Yes | IDs only | No | No |
| Project | `project.restored` | `RestoreProjectHandler` | `ProjectActivityProjectionListener` | `PROJECT_RESTORED` | Yes | IDs only | No | No |
| Project | `project.deleted` | `DeleteProjectHandler` | `ProjectActivityProjectionListener` | `PROJECT_DELETED` | Yes | IDs only after soft delete | No | No |
| Project | `project.member_added` | `AddProjectMemberHandler` | `ProjectActivityProjectionListener` | `PROJECT_MEMBER_ADDED` | Yes | Member display name via profile projection | No | No |
| Project | `project.member_removed` | `RemoveProjectMemberHandler` | `ProjectActivityProjectionListener` | `PROJECT_MEMBER_REMOVED` | Yes | Member display name via profile projection | No | No |
| Project | `project.ownership_transferred` | `TransferProjectOwnershipHandler` | `ProjectActivityProjectionListener` | `PROJECT_OWNERSHIP_TRANSFERRED` | Yes | Owner display names via profile projection | No | No |
| Project Section | `project.section_created` | `CreateProjectHandler`, `CreateProjectSectionHandler` | `ProjectSectionActivityProjectionListener` | `PROJECT_SECTION_CREATED` | Yes | Section name/position via section repo | No | No |
| Project Section | `project.section_renamed` | `RenameProjectSectionHandler` | `ProjectSectionActivityProjectionListener` | `PROJECT_SECTION_RENAMED` | Yes | New name only | No | No |
| Project Section | `project.section_reordered` | `ReorderProjectSectionHandler` | `ProjectSectionActivityProjectionListener` | `PROJECT_SECTION_REORDERED` | Yes | Previous/new position in event | No | No |
| Project Section | `project.section_deleted` | `DeleteProjectSectionHandler` | `ProjectSectionActivityProjectionListener` | `PROJECT_SECTION_DELETED` | Yes | Section name via including-deleted read | No | No |
| Project Section | `project.section_restored` | `RestoreProjectSectionHandler` | `ProjectSectionActivityProjectionListener` | `PROJECT_SECTION_RESTORED` | Yes | Section name/position via section repo | No | No |
| Task | `task.created` | `CreateTaskHandler` | `TaskActivityProjectionListener` | `TASK_CREATED` | Yes, reporter | Task/section/assignee snapshots via readers | No | No |
| Task | `task.updated` | `UpdateTaskDetailsHandler` | `TaskActivityProjectionListener` | `TASK_UPDATED` | Yes | Task title only, no previous/new values | No | No |
| Task | `task.assigned` | `AssignTaskHandler` | `TaskActivityProjectionListener` | `TASK_ASSIGNED` | Yes | Assignee display name via profile projection | No | No |
| Task | `task.unassigned` | `UnassignTaskHandler` | `TaskActivityProjectionListener` | `TASK_UNASSIGNED` | Yes | Previous assignee display name via profile projection | No | No |
| Task | `task.priority_changed` | `ChangeTaskPriorityHandler` | `TaskActivityProjectionListener` | `TASK_PRIORITY_CHANGED` | Yes | Previous/new priority in event | No | No |
| Task | `task.due_date_changed` | `SetTaskDueDateHandler` | `TaskActivityProjectionListener` | `TASK_DUE_DATE_CHANGED` | Yes | Previous/new due date in event | No | No |
| Task | `task.completed` | `CompleteTaskHandler` | `TaskActivityProjectionListener` | `TASK_COMPLETED` | Yes | Completed timestamp in event | No | No |
| Task | `task.reopened` | `ReopenTaskHandler` | `TaskActivityProjectionListener` | `TASK_REOPENED` | Yes | Task title via reader | No | No |
| Task | `task.moved` | `MoveTaskToSectionHandler` | `TaskActivityProjectionListener` | `TASK_MOVED` | Yes | Section names via section repo, positions in event | No | No |
| Task | `task.reordered` | `ReorderTaskHandler` | `TaskActivityProjectionListener` | `TASK_REORDERED` | Yes | Previous/new position in event | No | No |
| Task | `task.deleted` | `DeleteTaskHandler` | `TaskActivityProjectionListener` | `TASK_DELETED` | Yes | Task title via including-deleted reader | No | No |

No Project, ProjectSection, or Task event currently lacks an Activity listener. There are no Activity types without source events.

## Event Contract Backlog

- Add stable event IDs for all domain events.
- Add occurred-at timestamps to events.
- Add previous/new values to `project.updated`, `project.dates_changed`, `project.section_renamed`, and `task.updated`.
- Add snapshot labels to destructive events where live reads may hide soft-deleted records.
- Add projection tests for all Activity listeners after event IDs are introduced.

## Module Boundaries

Boundary decisions:

- Activity reads Project through exported `PROJECT_REPOSITORY`, `PROJECT_SECTION_REPOSITORY`, `PROJECT_USER_PROFILE_REPOSITORY`, and `ProjectAccessService`.
- Activity reads Task through the narrow exported `ACTIVITY_TASK_READER`, not the full Task repository.
- ProjectSection deletion checks Task usage through `TASK_SECTION_USAGE_SERVICE`, not Task persistence.
- Project uses Membership through `MembershipAccessService`, not Membership persistence.
- Activity actor display reuses the Project user profile projection and does not query Identity persistence.

Known coupling:

- Activity still uses Project repository contracts for project and section enrichment. This is acceptable for Phase 1 because those contracts were explicitly exported read contracts.

## Transaction Boundaries

Audited operations:

- Workspace creation persists Workspace then dispatches `workspace.created`; owner membership is process-local event handling, not the same DB transaction.
- Project creation wraps Project, Project OWNER member, and default General section in a transaction.
- Project ownership transfer updates Project and member roles in a transaction.
- Task move/reorder and ProjectSection reorder perform position updates and rebalance inside transactions.
- Invitation acceptance is transactional for invitation/member writes.
- Section deletion validates Task usage before soft delete in one transaction boundary.

Current limitation:

- Domain events are dispatched after persistence calls, but not after a true database commit hook.
- EventEmitter2 delivery is process-local and non-durable.
- If event projection fails after domain persistence succeeds, the write remains committed and Activity can be missing until Outbox replay exists.

## Idempotency Audit

Safe no-op retry:

- Task complete/reopen.
- Project archive/restore.
- Some update operations when values do not change.

Business conflict or invalid repeat:

- Duplicate project key creation.
- Reusing an accepted invitation.
- Removing a missing member.
- Deleting already-deleted sections/tasks.

Needs resilient-work backlog:

- Workspace owner membership from duplicate `workspace.created`.
- Invitation acceptance duplicate delivery.
- Activity projection duplicate delivery.
- Refresh-token rotation concurrency.
- Project creation retry after partial external failure once Outbox exists.

## Error And GraphQL Contract Findings

- Domain errors generally use typed error classes; no broad plain-string throwing was found in new Phase 1 modules.
- GraphQL resolvers remain thin and do not expose persistence entities.
- `JsonScalar` is registered once in `AppModule` and used for Activity metadata.
- Soft-deleted Tasks and Projects are excluded from normal reads by repository methods.
- Authorization uses Membership/Project access services instead of Activity-specific RBAC.

Backlog:

- Add explicit exception-filter audit to ensure all domain error codes map consistently to GraphQL extension codes.
- Add cross-tenant not-found/forbidden behavior tests.

## Database And Migration Audit

Required migrations are applied in order:

- `Migration20260713000000`
- `Migration20260713001000`
- `Migration20260713002000`
- `Migration20260713003000`

Schema notes:

- Decimal position columns use `numeric(20,6)`.
- Soft-delete indexes exist on Project Sections and Tasks.
- Activity metadata uses PostgreSQL `jsonb`.
- Activity feed indexes exist for Workspace, Project, Task, actor, type, subject, and occurred-at ordering.
- `activities.event_id` is nullable and unique. PostgreSQL allows multiple `NULL` values but rejects duplicate non-null values, which matches the current preparation strategy.

## Performance Sanity Check

- `projectListView` currently loads Project, active Sections, Tasks, and profiles through focused reads; no full aggregate graph is loaded.
- Activity resolver batches actor profiles per page using `findByUserIds`.
- Activity task projections may perform repeated task snapshot reads per event. Acceptable for process-local Phase 1; Outbox workers can batch later.
- `projectMembers` and workspace/member profile flows use local projection repositories.

Backlog:

- Add query-count integration tests around List View and Activity feeds once a test database harness exists.

## Test Coverage

Current meaningful tests include:

- Project domain behavior.
- ProjectSection domain behavior.
- Task domain behavior.
- Activity domain behavior.
- Activity cursor encoding/decoding.

Coverage gaps:

- Full end-to-end GraphQL flow.
- Transactional handler integration tests.
- Activity projection listener tests.
- Cursor pagination repository test against PostgreSQL.
- Duplicate non-null `event_id` database constraint test.

## Readiness For Outbox/Inbox

Backend is ready to start the resilience task after this audit cleanup.

Design constraints for the next task:

- Do not publish domain events directly to EventEmitter2 from write handlers.
- Persist outbox rows in the same transaction as domain writes.
- Add stable event IDs and occurred-at timestamps at event creation time.
- Dispatch from Outbox to EventEmitter2 or a local handler registry.
- Add Inbox/idempotency at projection consumers, including Activity.
- Keep Activity append-only.
- Preserve existing module read contracts and avoid exposing persistence entities.
