# Task And Project List View Dry Run

This document covers Prompt 3: Tasks plus the backend foundation for Project List View.

## Architecture Decisions

- Task follows the current module shape: `domain`, `features`, `infrastructure`, `presentation`. There is no `application` folder.
- Draft Task code was replaced because it modeled task progress as `TODO/IN_PROGRESS/IN_REVIEW/DONE` and had no workspace, section, position, lifecycle, or soft-delete fields.
- Task lifecycle is only `OPEN` or `COMPLETED`. Project Sections own grouping names like General, To Do, QC, or Done.
- Task ordering is scoped by `projectId + sectionId` and uses decimal positions with 1000-point gaps.
- Project List View is a read model, not a domain aggregate. It combines Project, active Project Sections, active Tasks, and the existing Project user profile projection.
- Section deletion checks the Task-owned `TASK_SECTION_USAGE_SERVICE` contract and throws `ProjectSectionHasTasksError` if active tasks exist.
- Project members may view/create/update tasks in projects they belong to. Only Workspace OWNER/ADMIN or Project OWNER may delete tasks.

## Migration

Run pending migrations from inside the app container:

```bash
docker compose up
docker compose exec app sh
npm run migration:up
```

The Task migration alters the draft `tasks` table. Existing draft rows are preserved only if they can be mapped to:

- a Project workspace
- the first active Project Section
- the old creator as reporter
- the old assignee as assignee

If a draft row cannot map to an active Project Section, the migration fails with a clear message so data can be repaired manually.

## Dry Run

1. Create a Project. The Project module creates a default General section.

2. Create a Task in the default section:

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    sectionId
    lifecycleStatus
    priority
    position
  }
}
```

```json
{
  "input": {
    "projectId": "PROJECT_ID",
    "title": "Prepare kickoff brief",
    "priority": "MEDIUM",
    "dueDate": "2026-07-20T10:00:00.000Z"
  }
}
```

3. Create another Section:

```graphql
mutation {
  createProjectSection(input: { projectId: "PROJECT_ID", name: "QC" }) {
    id
    name
    position
  }
}
```

4. Create a Task with assignee and due date:

```json
{
  "input": {
    "projectId": "PROJECT_ID",
    "sectionId": "SECTION_ID",
    "title": "Review task contracts",
    "assigneeUserId": "USER_ID",
    "priority": "HIGH",
    "dueDate": "2026-07-22T10:00:00.000Z"
  }
}
```

5. Fetch List View:

```graphql
query {
  projectListView(projectId: "PROJECT_ID") {
    project { id name key healthStatus }
    sections {
      id
      name
      position
      tasks {
        id
        title
        lifecycleStatus
        priority
        dueDate
        position
        assignee { userId displayName email }
      }
    }
  }
}
```

6. Reorder a Task within a Section:

```graphql
mutation {
  reorderTask(input: { taskId: "TASK_ID", afterTaskId: "PREVIOUS_TASK_ID" }) {
    id
    position
  }
}
```

7. Move a Task to another Section:

```graphql
mutation {
  moveTaskToSection(input: { taskId: "TASK_ID", targetSectionId: "SECTION_ID" }) {
    id
    sectionId
    position
  }
}
```

8. Complete and reopen:

```graphql
mutation {
  completeTask(taskId: "TASK_ID") {
    lifecycleStatus
    completedAt
  }
}
```

```graphql
mutation {
  reopenTask(taskId: "TASK_ID") {
    lifecycleStatus
    completedAt
  }
}
```

9. Unauthorized users fail through Project/Task access checks.

10. Section deletion fails while active Tasks exist:

```graphql
mutation {
  deleteProjectSection(sectionId: "SECTION_ID")
}
```

Expected error: `PROJECT_SECTION_HAS_TASKS`.

11. Move or delete active Tasks, then retry section deletion.

12. Deleted Tasks disappear from `projectTasks`, `myAssignedTasks`, and `projectListView`.

## Next Recommended Task

Implement the Activity module and event projections from the domain events emitted by Project, ProjectSection, and Task.
