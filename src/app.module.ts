import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { LoggerModule } from './core/logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    // Load environment variables and configuration settings
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
      envFilePath: ['.env'], // Path to environment variables file
    }),

    // Core Modules
    PrismaModule, // Handles database connections
    LoggerModule, // Application-wide logging

    // Feature Modules
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
