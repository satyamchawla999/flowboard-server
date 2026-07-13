import { ObjectType, Field } from '@nestjs/graphql';
import { UserGqlModel } from './user.model';

@ObjectType('AuthPayload')
export class AuthPayloadGqlModel {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserGqlModel)
  user!: UserGqlModel;
}
