export enum WorkspaceUserAccountStatus {
  ACTIVE = 'ACTIVE',
  UNVERIFIED = 'UNVERIFIED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

interface CreateWorkspaceUserProfileProps {
  userId: string;
  email: string;
  displayName: string;
  accountStatus: WorkspaceUserAccountStatus | string;
}

interface ReconstituteWorkspaceUserProfileProps extends CreateWorkspaceUserProfileProps {
  createdAt: Date;
  updatedAt: Date;
}

export class WorkspaceUserProfile {
  userId: string;
  email: string;
  displayName: string;
  accountStatus: WorkspaceUserAccountStatus | string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: ReconstituteWorkspaceUserProfileProps) {
    this.userId = props.userId;
    this.email = props.email.toLowerCase();
    this.displayName = props.displayName;
    this.accountStatus = props.accountStatus;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateWorkspaceUserProfileProps): WorkspaceUserProfile {
    const now = new Date();
    return new WorkspaceUserProfile({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ReconstituteWorkspaceUserProfileProps): WorkspaceUserProfile {
    return new WorkspaceUserProfile(props);
  }

  updateProfile(props: {
    email: string;
    displayName: string;
    accountStatus: WorkspaceUserAccountStatus | string;
  }): void {
    const normalizedEmail = props.email.toLowerCase();
    if (
      this.email === normalizedEmail &&
      this.displayName === props.displayName &&
      this.accountStatus === props.accountStatus
    ) {
      return;
    }

    this.email = normalizedEmail;
    this.displayName = props.displayName;
    this.accountStatus = props.accountStatus;
    this.updatedAt = new Date();
  }

  canCreateWorkspace(): boolean {
    return this.accountStatus !== WorkspaceUserAccountStatus.SUSPENDED;
  }
}
