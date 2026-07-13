import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '@common/errors';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { User } from '../../domain/models/user.model';

@Injectable()
export class GetMeHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('User', userId);
    return user;
  }
}
