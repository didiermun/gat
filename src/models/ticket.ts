import { Field, ObjectType, ID } from '@nestjs/graphql'
import { Plane } from './plane'
import { User } from './user'

@ObjectType()
export class Ticket {
    @Field(type => ID)
    id: string

    @Field(type => String)
    code: string

    @Field(type => ID)
    planeId: string

    @Field(type => ID, {nullable: true})
    userId: string

    @Field(type => User, { nullable: true })
    passenger: User

    @Field(type => Plane)
    plane?: Plane

    @Field(type => Boolean)
    isBooked: Boolean

    @Field(type => String)
    createdAt: Date
}