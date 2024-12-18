import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JWT_CONSTANTS } from 'src/constants/auth';
import { PrismaModule } from 'src/core/database/prisma.module';
import { UsersModule } from 'src/modules/users/users.module';
import { Logger } from 'src/core/logger/logger.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
