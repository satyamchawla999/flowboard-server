import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class PasswordHasherService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
