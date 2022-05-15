import { Field, ObjectType, ID } from '@nestjs/graphql'

@ObjectType()
export class CreateTicket {

    @Field(type => ID)
    planeId!: string

    @Field(type => ID)
    userId: string
}