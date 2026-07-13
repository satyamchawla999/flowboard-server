# Project Module Dry Run

This document covers the first Project module phase: project core, overview, lifecycle, health, dates, members, and ownership. It intentionally excludes sections, tasks, views, activity persistence, comments, attachments, and Kanban behavior.

## Scenario

1. Workspace OWNER creates a project.
2. A project key is generated when no key is supplied.
3. Project and owner `ProjectMember` are saved in the same transactional use case.
4. Workspace MEMBER cannot create a project.
5. Project owner adds a workspace member to the project.
6. Assigned member can view the project.
7. Unassigned workspace member cannot view it.
8. Project owner updates description.
9. Project health changes to `AT_RISK`.
10. Invalid start/due date fails.
11. Project is archived.
12. Archived project cannot be edited.
13. Project is restored.
14. Ownership is transferred.
15. Project is soft-deleted and disappears from normal project queries.

## GraphQL Examples

Set the auth header first:

```json
{
  "Authorization": "Bearer <accessToken>"
}
```

### Create Project

```graphql
mutation CreateProject($workspaceId: ID!) {
  createProject(
    input: {
      workspaceId: $workspaceId
      name: "FlowBoard Backend"
      description: "Core backend work"
      startDate: "2026-07-13T00:00:00.000Z"
      dueDate: "2026-08-13T00:00:00.000Z"
    }
  ) {
    id
    workspaceId
    name
    key
    healthStatus
    ownerUserId
    owner {
      id
      email
      displayName
    }
    members {
      userId
      role
    }
  }
}
```

Expected:

- `key` is generated from the name, for example `FB`.
- owner has a `ProjectMember` record with role `OWNER`.

### Workspace Member Cannot Create

Run `createProject` using a plain workspace `MEMBER` token.

Expected error code:

```text
INSUFFICIENT_WORKSPACE_PERMISSION
```

### Add Project Member

```graphql
mutation AddProjectMember($projectId: ID!, $userId: ID!) {
  addProjectMember(input: { projectId: $projectId, userId: $userId }) {
    id
    projectId
    userId
    role
    user {
      email
      displayName
    }
  }
}
```

Expected:

- target user must already be a workspace member.
- added role is always `MEMBER`.

### Assigned Member Can View Project

```graphql
query Project($projectId: ID!) {
  project(id: $projectId) {
    id
    name
    key
    owner {
      displayName
    }
    members {
      userId
      role
    }
  }
}
```

Run as an assigned project member. Expected: project overview is returned.

Run as an unassigned workspace member. Expected error code:

```text
INSUFFICIENT_PROJECT_PERMISSION
```

### Update Details

```graphql
mutation UpdateProjectDetails($projectId: ID!) {
  updateProjectDetails(
    input: {
      projectId: $projectId
      description: "Backend API foundation and workspace collaboration"
    }
  ) {
    id
    name
    key
    description
  }
}
```

Expected:

- key does not change.

### Update Health

```graphql
mutation UpdateProjectHealth($projectId: ID!) {
  updateProjectHealth(
    input: {
      projectId: $projectId
      healthStatus: AT_RISK
      statusMessage: "Migration and access-control work need review."
    }
  ) {
    id
    healthStatus
    statusMessage
  }
}
```

### Invalid Dates

```graphql
mutation InvalidDates($projectId: ID!) {
  updateProjectDates(
    input: {
      projectId: $projectId
      startDate: "2026-09-01T00:00:00.000Z"
      dueDate: "2026-08-01T00:00:00.000Z"
    }
  ) {
    id
  }
}
```

Expected error code:

```text
INVALID_PROJECT_DATE_RANGE
```

### Archive And Restore

```graphql
mutation ArchiveProject($projectId: ID!) {
  archiveProject(projectId: $projectId) {
    id
    isArchived
  }
}
```

Try editing after archive. Expected error code:

```text
PROJECT_ARCHIVED
```

```graphql
mutation RestoreProject($projectId: ID!) {
  restoreProject(projectId: $projectId) {
    id
    isArchived
  }
}
```

### Transfer Ownership

```graphql
mutation TransferProjectOwnership($projectId: ID!, $targetUserId: ID!) {
  transferProjectOwnership(input: { projectId: $projectId, targetUserId: $targetUserId }) {
    id
    ownerUserId
    members {
      userId
      role
    }
  }
}
```

Expected:

- target becomes `OWNER`.
- previous owner becomes `MEMBER`.
- Project `ownerUserId` matches the new owner.

### Delete Project

```graphql
mutation DeleteProject($projectId: ID!) {
  deleteProject(projectId: $projectId)
}
```

After deletion:

```graphql
query WorkspaceProjects($workspaceId: ID!) {
  workspaceProjects(input: { workspaceId: $workspaceId }) {
    id
    name
    key
  }
}
```

Expected:

- deleted project is excluded from normal list results.
