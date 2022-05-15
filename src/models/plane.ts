import { Field, ObjectType, ID } from '@nestjs/graphql'
import { Ticket } from './ticket'

@ObjectType()
export class Plane {
    @Field(type => ID)
    id: string

    @Field(type => String)
    name: string

    @Field(type => String)
    arrivalAirport: string

    @Field(type => String)
    depatureAirport: string

    @Field(type => String)
    depatureTime: Date

    @Field(type => String)
    arrivalTime: Date

    @Field(type => String)
    createdAt: Date

    @Field(type => [Ticket])
    tickets: Ticket[]
}