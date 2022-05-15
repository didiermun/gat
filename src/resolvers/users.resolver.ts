import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import {
  Args,
  Context,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { JwtService } from '@nestjs/jwt'
import { users } from '@prisma/client'
import { ApolloError } from 'apollo-server-express'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { Roles } from '../decorators/roles.decorator'
import { UserGuard } from '../guards/user.guard'
import { LoginUserInput } from '../inputs/LoginUser.input'
import { SignUpUserInput } from '../inputs/SingUpUser.input'
import { updatePasswordInput } from '../inputs/updatePassword.input'
import { UpdateUserInput } from '../inputs/UpdateUser.input'
import { ROLES, User } from '../models/user'
import { hash, validatePassword } from '../utils/hashPassword'

@ObjectType()
export class LoginResponse {
  @Field()
  token!: string
}

@Resolver(User)
export class UsersResolver {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Query(returns => User, { nullable: true, name: 'getUser' })
  async user(@Args('id') id: string) {
    return this.prismaService.users.findUnique({
      where: { id },
    })
  }

  @Mutation(returns => LoginResponse, { name: 'login' })
  async loginUser(@Args('data') data: LoginUserInput) {
    const findUser = await this.prismaService.users.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!findUser) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const doPasswordsMatch = await validatePassword(
      data.password,
      findUser.password,
    )

    if (!doPasswordsMatch) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const token = this.jwtService.sign(findUser)

    return { token }
  }

  @Query(returns => User, { nullable: true, name: 'me' })
  @UseGuards(UserGuard)
  async getLoggedIn(@Context() ctx) {
    return ctx.user
  }

  @Mutation(returns => User)
  async signup(@Args('data') data: SignUpUserInput) {
    const checkUserExists = await this.prismaService.users.findFirst({
      where: {
        email: data.email,
      },
    })

    if (checkUserExists) {
      throw new HttpException('Email already Exists', HttpStatus.BAD_REQUEST)
    }

    const hashedPassword = await hash(data.password)

    return this.prismaService.users.create({
      data: {
        email: data.email,
        lastName: data.lastName,
        firstName: data.lastName,
        password: hashedPassword,
        role: data.role,
      },
    })
  }

  @Mutation(returns => User, { name: 'updateUser' })
  @UseGuards(UserGuard)
  async updateUser(
    @Args('data') data: UpdateUserInput,
    @Context() ctx,
  ): Promise<users> {
    const user = await this.prismaService.users.findUnique({
      where: { id: ctx.user.id },
    })
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND')
    }
    const updatedUser = await this.prismaService.users.update({
      where: {
        id: ctx.user.id,
      },
      data: data,
    })

    return updatedUser
  }

  @Mutation(returns => User, { name: 'updateUserPassword' })
  @UseGuards(UserGuard)
  async updateUserPassword(
    @Args('data') data: updatePasswordInput,
    @Context() ctx,
  ) {
    const checkPassword = await bcrypt.compare(
      data.currentPassword,
      ctx.user.password,
    )

    if (!checkPassword) {
      throw new ForbiddenException('Password mismatch')
    }

    const updatedUser = await this.prismaService.users.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        password: await hash(data.newPassword),
      },
    })
    return updatedUser
  }

  @Mutation(returns => User, { name: 'deleteUser' })
  @UseGuards(UserGuard)
  @Roles(ROLES.ADMIN)
  async deleteUser(@Args('id') id: string, @Context() ctx) {
    const deleteUser = await this.prismaService.users.delete({
      where: {
        id,
      },
    })
    return deleteUser
  }
}
