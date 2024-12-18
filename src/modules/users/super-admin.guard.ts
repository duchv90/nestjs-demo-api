import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RESPONSE_MESSAGES } from 'src/constants/message';
import { USERS_ROLES } from 'src/constants/users';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { params } = request;

    const currentUserId: number = request.user?.userId;
    if (currentUserId) {
      const targetUserId: number = parseInt(params.id, 10);
      const currentUserRoles: string[] =
        await this.usersService.getUserRoles(currentUserId);
      let targetRoles: string[] = [];

      if (targetUserId) {
        targetRoles = await this.usersService.getUserRoles(targetUserId);
      }

      if (targetRoles.includes(USERS_ROLES.SUPER_ADMIN)) {
        // The current user must have the SuperAdmin role to update the SuperAdmin user.
        return currentUserRoles.includes(USERS_ROLES.SUPER_ADMIN);
      }
    } else {
      throw new ForbiddenException(RESPONSE_MESSAGES.ACCESS_DENIED);
    }

    return true;
  }
}
