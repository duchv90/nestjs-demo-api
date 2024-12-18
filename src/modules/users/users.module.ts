import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/core/database/prisma.module';
import { Logger } from 'src/core/logger/logger.service';

@Module({
  controllers: [UsersController],
  imports: [PrismaModule],
  providers: [UsersService, Logger],
  exports: [UsersService],
})
export class UsersModule {}
