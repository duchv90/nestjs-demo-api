import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaModule } from 'src/core/database/prisma.module';
import { UsersModule } from '../users/users.module';
import { Logger } from 'src/core/logger/logger.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, Logger],
})
export class PermissionsModule {}
