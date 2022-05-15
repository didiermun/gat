import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from 'src/utils/jwtSetup'
import { PlaneResolver } from 'src/resolvers/plane.resolver'

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [PlaneResolver, PrismaService],
})
export class PlanesModule {}
