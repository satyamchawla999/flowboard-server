import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Session')
export class SessionGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field()
  expiresAt!: Date;

  @Field({ nullable: true })
  revokedAt?: Date;

  @Field()
  createdAt!: Date;
}
