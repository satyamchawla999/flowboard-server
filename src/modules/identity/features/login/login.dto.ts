export interface LoginDto {
  email: string;
  password: string;
  userAgent: string | null;
  ipAddress: string | null;
}
