import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Reflector } from '@nestjs/core';
import { USERS_PERMISSTIONS } from 'src/constants/users';
import { RESPONSE_MESSAGES } from 'src/constants/message';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<USERS_PERMISSTIONS[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentUserId: number = request.user?.userId;
    if (currentUserId) {
      return await this.usersService.hasPermission(
        currentUserId,
        requiredPermissions,
      );
    } else {
      throw new ForbiddenException(RESPONSE_MESSAGES.ACCESS_DENIED);
    }
  }
}
