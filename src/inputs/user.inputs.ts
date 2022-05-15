import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty } from 'class-validator'

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email!: string

  @Field()
  firstName!: string

  @Field()
  lastName!: string

  @Field()
  password: string

  @Field()
  phone: string

  @Field()
  address: string
}

@InputType()
export class LoginUserInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @Field()
  @IsNotEmpty()
  password!: string
}

@InputType()
export class UpdatePassword {
  @Field()
  @IsNotEmpty()
  old_password: string

  @Field()
  @IsNotEmpty()
  new_password!: string
}
