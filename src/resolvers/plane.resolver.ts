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
    Mutation,
    Query,
    Resolver,
  } from '@nestjs/graphql'
  import { JwtService } from '@nestjs/jwt'
  import { ApolloError } from 'apollo-server-express'
  import { CreatePlaneInput } from 'src/inputs/plane.inputs'
  import { Plane } from 'src/models/plane'
  import { PrismaService } from 'src/prisma.service'
  import { UserGuard } from '../guards/user.guard'
  
  @Resolver(Plane)
  export class PlaneResolver{
    constructor(
      @Inject(PrismaService) private prismaService: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    @Query(returns => Plane, { nullable: true, name: 'getPlane' })
    async plane(@Args('id') id: string) {
      return this.prismaService.plane.findUnique({
        where: { id },
        include:{
            tickets: true,
        }
      })
    }
  
    @Query(returns => [Plane], { nullable: true, name: 'allPlanes'})
    async allPlanes(){
      return await this.prismaService.plane.findMany({
        include: {
          tickets: true
        }
      })
    }
  
  
    @Mutation(returns => Plane)
    async addNewPlane(@Args('data') data: CreatePlaneInput) {
      const exists = await this.prismaService.plane.findFirst({
        where: {
          name: data.name,
        },
      })
  
      if (exists) {
        throw new HttpException('Plane name already exists', HttpStatus.BAD_REQUEST)
      }
  
      const created = await this.prismaService.plane.create({
        data,
      })

      return await this.plane(created.id)
    }
  
    @Mutation(returns => Plane, { name: 'updatePlane' })
    @UseGuards(UserGuard)
    async updatePlane(
      @Args('data') data: CreatePlaneInput,
      @Context() ctx,
    ) {
      const user = await this.prismaService.user.findUnique({
        where: { id: ctx.user.id },
      })
      if (!user) {
        throw new ApolloError('Plane not found', 'PLANE_NOT_FOUND')
      }
      const updatedPlane = await this.prismaService.plane.update({
        where: {
          id: ctx.user.id,
        },
        data: data,
      })
  
      return await this.plane(updatedPlane.id);
    }
  
    
  
    @Mutation(returns => Plane, { name: 'deletePlane' })
    @UseGuards(UserGuard)
    async deletePlane(@Args('id') id: string, @Context() ctx) {
      const deletePlane = await this.prismaService.plane.delete({
        where: {
          id,
        },
      })
      return deletePlane
    }
  }
  