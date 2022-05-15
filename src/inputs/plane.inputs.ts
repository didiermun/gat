import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class Plane {
    
    @Field()
    name!: string

    @Field()
    arrivalAirport!: string

    @Field()
    depatureAirport!: string

    @Field()
    depatureTime!: Date

    @Field()
    arrivalTime!: Date
}