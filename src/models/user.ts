import { Field, ObjectType, ID } from '@nestjs/graphql'
import { Ticket } from './ticket'

@ObjectType()
export class User {
    @Field(type => ID)
    id: string

    @Field(type => String)
    email: string

    @Field(type => String)
    firstName: string

    @Field(type => String)
    lastName: string

    @Field(type => String, { nullable: true })
    phone: string

    @Field(type => String)
    address: string

    @Field(type => String)
    createdAt: Date

    @Field(type => [Ticket])
    tickets?: Ticket[]
}