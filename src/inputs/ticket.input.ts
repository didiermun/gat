import { Field, ObjectType, ID } from '@nestjs/graphql'

@ObjectType()
export class Ticket {

    @Field(type => ID)
    planeId!: string

    @Field(type => ID)
    userId: string
}