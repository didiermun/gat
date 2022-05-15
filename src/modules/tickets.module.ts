import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from 'src/utils/jwtSetup'
import { TicketResolver } from 'src/resolvers/ticket.resolver'

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [TicketResolver, PrismaService],
})
export class TicketsModule {}
