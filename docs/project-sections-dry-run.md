# Project Sections Dry Run

Project sections are logical project groupings for future List and Board views. They are not Kanban-only columns, and they do not own tasks yet.

## Decisions

- Default section: every new project gets one `General` section.
- Default section creation is part of the `create-project` transaction.
- Position strategy: numeric decimal positions with 1000-point gaps.
- Example order: `General = 1000`, `TO-DO = 2000`, `DOING = 3000`.
- Insertions use midpoint positions, for example inserting between `1000` and `2000` creates `1500`.
- Section names are trimmed and may repeat.
- Section deletion is soft deletion.
- Task checks are intentionally not implemented yet. Once the Task module is rebuilt, section deletion should block or require moving tasks first.
- EventEmitter2 delivery is process-local and not durable; no outbox is implemented in this phase.

## Flow

1. Workspace OWNER creates a project.
2. `General` section is created atomically.
3. Project OWNER lists sections.
4. Project OWNER creates `TO-DO`.
5. Project OWNER creates `DOING`.
6. `DOING` is moved before `TO-DO`.
7. Section is renamed.
8. Project MEMBER lists sections.
9. Project MEMBER fails to create/reorder a section.
10. Archived project rejects section updates.
11. Section is soft-deleted.
12. Deleted section disappears from standard queries.
13. Section is restored and appended to the end.

## GraphQL Examples

### Create Project

```graphql
mutation CreateProject($workspaceId: ID!) {
  createProject(input: { workspaceId: $workspaceId, name: "FlowBoard Backend" }) {
    id
    name
    key
  }
}
```

### List Default Sections

```graphql
query ProjectSections($projectId: ID!) {
  projectSections(projectId: $projectId) {
    id
    name
    position
  }
}
```

Expected:

```text
General 1000
```

### Create Sections

```graphql
mutation CreateTodo($projectId: ID!) {
  createProjectSection(input: { projectId: $projectId, name: "TO-DO" }) {
    id
    name
    position
  }
}
```

```graphql
mutation CreateDoing($projectId: ID!) {
  createProjectSection(input: { projectId: $projectId, name: "DOING" }) {
    id
    name
    position
  }
}
```

### Move DOING Before TO-DO

```graphql
mutation ReorderSection($doingId: ID!, $todoId: ID!) {
  reorderProjectSection(input: { sectionId: $doingId, beforeSectionId: $todoId }) {
    id
    name
    position
  }
}
```

Expected:

- `DOING` receives a position before `TO-DO`.
- The list remains sorted by `position`.

### Rename Section

```graphql
mutation RenameSection($sectionId: ID!) {
  renameProjectSection(input: { sectionId: $sectionId, name: "QC" }) {
    id
    name
  }
}
```

### Delete Section

```graphql
mutation DeleteSection($sectionId: ID!) {
  deleteProjectSection(sectionId: $sectionId)
}
```

After deletion, `projectSections(projectId)` excludes the deleted section.

### Restore Section

```graphql
mutation RestoreSection($sectionId: ID!) {
  restoreProjectSection(sectionId: $sectionId) {
    id
    name
    position
  }
}
```

Restored sections are appended to the end to avoid position collisions.

### Archived Project Rejects Updates

```graphql
mutation ArchiveProject($projectId: ID!) {
  archiveProject(projectId: $projectId) {
    id
    isArchived
  }
}
```

Then try `createProjectSection`, `renameProjectSection`, or `reorderProjectSection`.

Expected error code:

```text
PROJECT_ARCHIVED
```
