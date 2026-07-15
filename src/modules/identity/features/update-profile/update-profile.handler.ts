import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { EntityNotFoundError } from '@common/errors';
import { DomainEventDispatcherService } from '../../infrastructure/services/domain-event-dispatcher.service';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { User } from '../../domain/models/user.model';
import type { UpdateProfileDto } from './update-profile.dto';

@Injectable()
export class UpdateProfileHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventDispatcher: DomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('User', userId);

    if (dto.displayName !== undefined) user.updateDisplayName(dto.displayName);
    if (dto.timezone !== undefined) user.updateTimezone(dto.timezone);

    await this.userRepository.save(user);
    await this.eventDispatcher.dispatchAggregateEvents(user);

    return user;
  }
}
