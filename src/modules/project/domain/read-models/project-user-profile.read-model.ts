interface ProjectUserProfileProps {
  userId: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectUserProfile {
  userId: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: ProjectUserProfileProps) {
    this.userId = props.userId;
    this.email = props.email.toLowerCase();
    this.displayName = props.displayName;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: { userId: string; email: string; displayName: string }): ProjectUserProfile {
    const now = new Date();
    return new ProjectUserProfile({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: ProjectUserProfileProps): ProjectUserProfile {
    return new ProjectUserProfile(props);
  }

  updateProfile(email: string, displayName: string): void {
    this.email = email.toLowerCase();
    this.displayName = displayName;
    this.updatedAt = new Date();
  }
}
