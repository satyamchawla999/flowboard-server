import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AccountStatus } from '../../../../domain/value-objects/account-status.vo';

registerEnumType(AccountStatus, { name: 'AccountStatus' });

@ObjectType('User')
export class UserGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field()
  timezone!: string;

  @Field(() => AccountStatus)
  accountStatus!: AccountStatus;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
