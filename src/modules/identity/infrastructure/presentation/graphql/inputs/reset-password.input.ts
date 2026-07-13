import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @MinLength(1)
  token!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
