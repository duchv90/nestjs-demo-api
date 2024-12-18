import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaModule } from 'src/core/database/prisma.module';
import { UsersModule } from '../users/users.module';
import { Logger } from 'src/core/logger/logger.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [RolesController],
  providers: [RolesService, Logger],
})
export class RolesModule {}
