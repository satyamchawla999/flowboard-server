import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
