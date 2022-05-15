import { Field, ID, InputType } from '@nestjs/graphql'

@InputType()
export class CreateTicket {

    @Field(type => ID)
    planeId!: string

    @Field(type => ID)
    userId: string
}