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
import { ApolloError } from 'apollo-server-express'
import * as bcrypt from 'bcrypt'
import { CreateUserInput, LoginUserInput, UpdatePassword } from 'src/inputs/User.inputs'
import { PrismaService } from 'src/prisma.service'
import { UserGuard } from '../guards/user.guard'
import { User } from '../models/user'
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
    return this.prismaService.user.findUnique({
      where: { id },
      include:{
        tickets: true,
      }
    })
  }

  @Query(returns => [User], { nullable: true, name: 'allUsers'})
  async allUsers(){
    return await this.prismaService.user.findMany({
      include: {
        tickets: true
      }
    })
  }

  @Mutation(returns => LoginResponse, { name: 'login' })
  async loginUser(@Args('data') data: LoginUserInput) {
    const findUser = await this.prismaService.user.findUnique({
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
  async signup(@Args('data') data: CreateUserInput) {
    const checkUserExists = await this.prismaService.user.findFirst({
      where: {
        email: data.email,
      },
    })

    if (checkUserExists) {
      throw new ApolloError('Email already Exists', 'EMAIL_DUPLICATE');
    }

    //generate a hashed password
    const hashedPassword = await hash(data.password)

    const created =  await this.prismaService.user.create({
      data: {...data, password: hashedPassword},
    })

    return await this.user(created.id)
  }

  @Mutation(returns => User, { name: 'updateUser' })
  async updateUser(
    @Args('data') data: CreateUserInput,
    @Context() ctx,
  ) {

    //check if user exists
    const user = await this.prismaService.user.findFirst({
      where: { id: ctx.user.id },
    })
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND')
    }
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: ctx.user.id,
      },
      data: data,
    })

    return await this.user(updatedUser.id);
  }

  @Mutation(returns => User, { name: 'updateUserPassword' })
  async updateUserPassword(
    @Args('data') data: UpdatePassword,
    @Context() ctx,
  ) {
    const checkPassword = await bcrypt.compare(
      data.oldPassword,
      ctx.user.password,
    )

    if (!checkPassword) {
      throw new ForbiddenException('Password mismatch')
    }

    const updatedUser = await this.prismaService.user.update({
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
  async deleteUser(@Args('id') id: string, @Context() ctx) {
    const deleteUser = await this.prismaService.user.delete({
      where: {
        id,
      },
    })
    return deleteUser
  }
}
