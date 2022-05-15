import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { JwtModule } from '@nestjs/jwt'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { PlanesModule } from './modules/planes.module'
import { TicketsModule } from './modules/tickets.module'
import { UsersModule } from './modules/users.module'
import { jwtConstants } from './utils/jwtSetup'

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: true,
      introspection: true,

      installSubscriptionHandlers: true,
      formatError: (error: GraphQLError) => {
        console.log({ error })
        if (error.message === 'VALIDATION_ERROR') {
          const extensions = {
            code: 'VALIDATION_ERROR',
            errors: [],
          }

          Object.keys(error.extensions.invalidArgs).forEach(key => {
            const constraints = []
            Object.keys(error.extensions.invalidArgs[key].constraints).forEach(
              _key => {
                constraints.push(
                  error.extensions.invalidArgs[key].constraints[_key],
                )
              },
            )

            extensions.errors.push({
              field: error.extensions.invalidArgs[key].property,
              errors: constraints,
            })
          })

          const graphQLFormattedError: GraphQLFormattedError = {
            message: 'VALIDATION_ERROR',
            extensions: extensions,
          }

          return graphQLFormattedError
        } else if (error.extensions.code === 'UNAUTHENTICATED') {
          return {
            status: 400,
            message: 'Not authenticated',
            error: 'Unauthenticated',
          }
        } else if (error.extensions.code === 'PLANE_NOT_FOUND') {
          return {
            status: 404,
            message: 'Plane not found, Data form token fails in data store',
            error: 'Notfound',
          }
        }
        else if (error.extensions.code === 'USER_NOT_FOUND') {
          return {
            status: 404,
            message: 'User not found, Data form token fails in data store',
            error: 'Notfound',
          }
        } 
        else if (error.extensions.code === 'TICKET_NOT_FOUND') {
          return {
            status: 404,
            message: 'Ticket not found, Data form token fails in data store',
            error: 'Notfound',
          }
        }
        else if (error.extensions.code === 'TICKET_DUPLICATE') {
          return {
            status: 400,
            message: 'User can not have more than one ticket on one plane',
            error: 'Duplicates',
          }
        }else if (!error.path) {
          return {
            message: error.message,
            status: 400,
          }
        } else {
          if (error.extensions.exception.name === 'JsonWebTokenError') {
            const graphQLFormattedError = {
              status: 404,
              message: 'Invalid token',
              error: 'Unauthorized',
            }
            return graphQLFormattedError
          } else if (error.extensions.exception.code === 'P2002') {
            const field = error.extensions.exception.meta.target[0]
            const graphQLFormattedError = {
              status: 404,
              message: 'Invalid Data',
              error: `${field} Already exists`,
            }
            return graphQLFormattedError
          } else {
            return error.extensions?.exception?.response
          }
        }
      },
    }),
    UsersModule,
    PlanesModule,
    TicketsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
