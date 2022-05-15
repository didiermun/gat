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
  import { CreateTicket } from 'src/inputs/ticket.input'
  import { Plane } from 'src/models/plane'
  import { Ticket } from 'src/models/ticket'
  import { PrismaService } from 'src/prisma.service'
  import { UserGuard } from '../guards/user.guard'
  
  @Resolver(Plane)
  export class TicketResolver {
    constructor(
      @Inject(PrismaService) private prismaService: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    @Query(returns => Ticket, { nullable: true, name: 'getTicket' })
    async plane(@Args('id') id: string) {
      return this.prismaService.ticket.findUnique({
        where: { id },
        include:{
            passenger: true,
            plane: true,
        }
      })
    }
  
    @Query(returns => [Plane], { nullable: true, name: 'allTickets'})
    async allTickets(){
      return await this.prismaService.ticket.findMany({
        include: {
          passenger: true,
          plane: true,
        }
      })
    }
  
  
    @Mutation(returns => Plane)
    async addNewTicket(@Args('data') data: CreateTicket) {
  
      return this.prismaService.ticket.create({
        data: {...data, code: '432'},
      })
    }
  
    @Mutation(returns => Ticket, { name: 'updateTicket' })
    @UseGuards(UserGuard)
    async updateTicket(@Args('id') id: string,
      @Args('data') data: CreateTicket,
      @Context() ctx,
    ): Promise<Ticket> {
      const user = await this.prismaService.user.findUnique({
        where: { id: ctx.user.id },
      })
      if (!user) {
        throw new ApolloError('Ticket not found', 'TICKET_NOT_FOUND')
      }
      const updateTicket = await this.prismaService.ticket.update({
        where: {
          id: ctx.user.id,
        },
        data: data,
      })
  
      return updateTicket
    }
  
    
  
    @Mutation(returns => Plane, { name: 'deleteTicket' })
    @UseGuards(UserGuard)
    async deleteTicket(@Args('id') id: string, @Context() ctx) {
      const deletePlane = await this.prismaService.plane.delete({
        where: {
          id,
        },
      })
      return deletePlane
    }
  }
  