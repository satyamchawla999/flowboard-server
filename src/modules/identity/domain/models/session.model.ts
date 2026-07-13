import { BaseDomainModel } from '@common/base';

interface CreateSessionProps {
  id?: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
}

interface ReconstituteSessionProps {
  id?: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Session extends BaseDomainModel {
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;

  private constructor(props: ReconstituteSessionProps) {
    super(props.id);
    this.userId = props.userId;
    this.refreshTokenHash = props.refreshTokenHash;
    this.userAgent = props.userAgent;
    this.ipAddress = props.ipAddress;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateSessionProps): Session {
    return new Session({
      id: props.id,
      userId: props.userId,
      refreshTokenHash: props.refreshTokenHash,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
      expiresAt: props.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: ReconstituteSessionProps): Session {
    return new Session(props);
  }

  revoke(): void {
    this.revokedAt = new Date();
    this.touch();
  }

  isActive(): boolean {
    return this.revokedAt === null && this.expiresAt > new Date();
  }
}
