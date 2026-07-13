interface CreateMembershipUserProfileProps {
  userId: string;
  email: string;
  displayName: string;
}

interface ReconstituteMembershipUserProfileProps extends CreateMembershipUserProfileProps {
  createdAt: Date;
  updatedAt: Date;
}

export class MembershipUserProfile {
  userId: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: ReconstituteMembershipUserProfileProps) {
    this.userId = props.userId;
    this.email = props.email.toLowerCase();
    this.displayName = props.displayName;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateMembershipUserProfileProps): MembershipUserProfile {
    const now = new Date();
    return new MembershipUserProfile({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(
    props: ReconstituteMembershipUserProfileProps,
  ): MembershipUserProfile {
    return new MembershipUserProfile(props);
  }

  updateProfile(email: string, displayName: string): void {
    const normalizedEmail = email.toLowerCase();
    if (this.email === normalizedEmail && this.displayName === displayName) return;

    this.email = normalizedEmail;
    this.displayName = displayName;
    this.updatedAt = new Date();
  }
}
