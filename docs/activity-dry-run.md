# Activity Module Dry Run

Activity is an append-only projection for meaningful Project, Project Section, and Task events.

## Event Coverage Matrix

| Event | Activity Type | Subject | Enrichment |
| --- | --- | --- | --- |
| `project.created` | `PROJECT_CREATED` | Project | project name from Project repo, key from event |
| `project.updated` | `PROJECT_UPDATED` | Project | project name when available |
| `project.health_changed` | `PROJECT_HEALTH_CHANGED` | Project | previous/new health from event, status message from Project repo |
| `project.dates_changed` | `PROJECT_DATES_CHANGED` | Project | current dates from Project repo |
| `project.archived` | `PROJECT_ARCHIVED` | Project | IDs from event |
| `project.restored` | `PROJECT_RESTORED` | Project | IDs from event |
| `project.deleted` | `PROJECT_DELETED` | Project | IDs from event |
| `project.member_added` | `PROJECT_MEMBER_ADDED` | Project | member display name from Project profile projection |
| `project.member_removed` | `PROJECT_MEMBER_REMOVED` | Project | member display name from Project profile projection |
| `project.ownership_transferred` | `PROJECT_OWNERSHIP_TRANSFERRED` | Project | owner display names from Project profile projection |
| `project.section_created` | `PROJECT_SECTION_CREATED` | Project Section | section name and position from Section repo |
| `project.section_renamed` | `PROJECT_SECTION_RENAMED` | Project Section | current section name |
| `project.section_reordered` | `PROJECT_SECTION_REORDERED` | Project Section | previous/new position from event, section name from Section repo |
| `project.section_deleted` | `PROJECT_SECTION_DELETED` | Project Section | section name from Section repo including deleted |
| `project.section_restored` | `PROJECT_SECTION_RESTORED` | Project Section | section name and position |
| `task.created` | `TASK_CREATED` | Task | task title, section name, assignee display name |
| `task.updated` | `TASK_UPDATED` | Task | task title |
| `task.assigned` | `TASK_ASSIGNED` | Task | task title and assignee display name |
| `task.unassigned` | `TASK_UNASSIGNED` | Task | task title and previous assignee display name |
| `task.priority_changed` | `TASK_PRIORITY_CHANGED` | Task | previous/new priority from event |
| `task.due_date_changed` | `TASK_DUE_DATE_CHANGED` | Task | previous/new due date from event |
| `task.completed` | `TASK_COMPLETED` | Task | completedAt from event |
| `task.reopened` | `TASK_REOPENED` | Task | task title |
| `task.moved` | `TASK_MOVED` | Task | from/to section IDs and names, previous/new position |
| `task.reordered` | `TASK_REORDERED` | Task | section name, previous/new position |
| `task.deleted` | `TASK_DELETED` | Task | task title and section ID |

## Design Notes

- Activity stores structured `metadata` as JSONB. It does not store rendered English messages.
- Actor profile display uses the existing Project user profile projection. Activity does not query Identity persistence.
- Existing events do not have stable event IDs. The `activities.event_id` column is nullable and unique, preparing for Outbox/Inbox without rewriting every event now.
- Projection delivery is currently best-effort and process-local through EventEmitter2.
- Cursor pagination is ordered by `occurredAt DESC, id DESC`, with `first` defaulting to 20 and capped at 100.

## GraphQL Examples

Workspace feed:

```graphql
query WorkspaceActivity($input: WorkspaceActivityInput!) {
  workspaceActivity(input: $input) {
    edges {
      cursor
      node {
        id
        type
        subjectType
        subjectId
        metadata
        occurredAt
        actor { id displayName }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

```json
{
  "input": {
    "workspaceId": "WORKSPACE_ID",
    "first": 20
  }
}
```

Project feed:

```graphql
query {
  projectActivity(input: { projectId: "PROJECT_ID", first: 20 }) {
    edges {
      cursor
      node { type projectId taskId sectionId metadata occurredAt }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

Task feed:

```graphql
query {
  taskActivity(input: { taskId: "TASK_ID", first: 20 }) {
    edges {
      node { type taskId metadata actor { displayName } }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

Continue pagination:

```json
{
  "input": {
    "projectId": "PROJECT_ID",
    "first": 20,
    "after": "END_CURSOR"
  }
}
```

## End-To-End Dry Run

1. User creates Project.
2. `PROJECT_CREATED` Activity is appended.
3. User changes Project health.
4. `PROJECT_HEALTH_CHANGED` Activity stores previous/new health.
5. User creates a Section.
6. `PROJECT_SECTION_CREATED` Activity is appended.
7. User creates Task.
8. `TASK_CREATED` Activity stores task, section, priority, due date, and assignee snapshots where available.
9. User assigns Task.
10. `TASK_ASSIGNED` Activity is appended.
11. User moves Task between Sections.
12. `TASK_MOVED` metadata contains source and destination section IDs/names.
13. User completes Task.
14. `TASK_COMPLETED` Activity is appended.
15. Project Activity feed returns related project, section, and task records newest-first.
16. Task Activity feed returns only records with that Task ID.
17. Unauthorized users fail through Membership or Project authorization.
18. Pagination returns stable cursors.
19. Duplicate prevention is prepared through nullable unique `event_id`; first-class idempotency waits for Outbox/Inbox.

## Next Task

Recommended next backend task: resilient event handling with transactional Outbox/Inbox, dispatcher worker, idempotent retries, and dead-letter strategy.
