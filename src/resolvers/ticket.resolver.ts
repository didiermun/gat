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
  import { CreateTicket } from 'src/inputs/ticket.input'
  import { Ticket } from 'src/models/ticket'
  import { PrismaService } from 'src/prisma.service'
import { generateCode } from 'src/utils/codeGenerator'
  import { UserGuard } from '../guards/user.guard'
  
  @Resolver(Ticket)
  export class TicketResolver {
    constructor(
      @Inject(PrismaService) private prismaService: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    @Query(returns => Ticket, { nullable: true, name: 'getTicket' })
    async ticket(@Args('id') id: string) {
      return this.prismaService.ticket.findUnique({
        where: { id },
        include:{
            passenger: true,
            plane: true,
        }
      })
    }
  
    @Query(returns => [Ticket], { nullable: true, name: 'allTickets'})
    async allTickets(){
      return await this.prismaService.ticket.findMany({
        include: {
          passenger: true,
          plane: true,
        }
      })
    }
  
  
    @Mutation(returns => Ticket)
    async addNewTicket(@Args('data') data: CreateTicket) {
        let code = "";
        let found = true;

        const plane = await this.prismaService.plane.findUnique({ 
            where:{
                id: data.planeId
            }
        })

        if(!plane){
            throw new ApolloError('Plane not found', 'PLANE_NOT_FOUND');
        }

        if(data.userId || data.userId === ""){
            const user = await this.prismaService.user.findFirst({ 
                where:{
                    id: data.userId
                }
            })

            if(!user){
                throw new ApolloError('User not found', 'USER_NOT_FOUND');
            }

            const exists = await this.prismaService.ticket.findFirst({
                where:{
                    userId: data.userId,
                    planeId: data.planeId
                }
            })

            if(exists){
                throw new ApolloError('One user can not have two tickets in one plane', 'TICKET_DUPLICATE');
            }
        }
        while(found){
            code = generateCode();
            const ticket = await this.prismaService.ticket.findFirst({
                where:{
                    code: code,
                    planeId: data.planeId,
                }
            })
            if(!ticket){
                found = false;
            }
        }
        const created = await this.prismaService.ticket.create({
            data: {
                ...data,
                code,
                isBooked: data.userId ? true : false
                },
        })

        return await this.ticket(created.id)
    }
  
    @Mutation(returns => Ticket, { name: 'updateTicket' })
    @UseGuards(UserGuard)
    async updateTicket(@Args('id') id: string,
      @Args('data') data: CreateTicket,
      @Context() ctx,
    ) {
        if(data.planeId || data.planeId === ""){
            const plane  =  await this.prismaService.plane.findFirst({ 
                where:{
                    id: data.planeId
                }
            })
            if(!plane){
                throw new ApolloError('Plane not found', 'PLANE_NOT_FOUND');
            }
        }

        if(data.userId || data.userId === ""){
            const user = await this.prismaService.user.findFirst({ 
                where:{
                    id: data.userId
                }
            })

            if(!user){
                throw new ApolloError('User not found', 'USER_NOT_FOUND');
            }
        }

        const ticket = await this.prismaService.ticket.findUnique({
            where: { id: id },
        })
        if (!ticket) {
            throw new ApolloError('Ticket not found', 'TICKET_NOT_FOUND')
        }
        const updateTicket = await this.prismaService.ticket.update({
            where: {
            id: id,
            },
            data: {...data, isBooked: data.userId || ticket.userId ? true: false},
        })
    
        return await this.ticket(updateTicket.id);
    }

    @Mutation(returns => Ticket, { name: 'addUserToTicket' })
    @UseGuards(UserGuard)
    async addUserToTicket(@Args('id') id: string,
      @Args('userId') userId: string,
    ) {
        const user = await this.prismaService.user.findFirst({
            where:{
                id: userId,
            }
        })

        if(!user){
            throw new ApolloError('User not found', 'USER_NOT_FOUND');
        }

        const ticket = await this.prismaService.user.findUnique({
            where: { id: id },
        })
        if (!ticket) {
            throw new ApolloError('Ticket not found', 'TICKET_NOT_FOUND')
        }
        const updateTicket = await this.prismaService.ticket.update({
            where: {
            id: id,
            },
            data: {userId},
        })
    
        return await this.ticket(updateTicket.id);
    }
  
    
  
    @Mutation(returns => Ticket, { name: 'deleteTicket' })
    @UseGuards(UserGuard)
    async deleteTicket(@Args('id') id: string, @Context() ctx) {
      const deleteTicket = await this.prismaService.ticket.delete({
        where: {
          id,
        },
      })
      return deleteTicket
    }
  }
  