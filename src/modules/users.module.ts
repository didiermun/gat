import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UsersResolver } from '../resolvers/users.resolver'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from 'src/utils/jwtSetup'

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [UsersResolver, PrismaService],
})
export class UsersModule {}
