import { SetMetadata } from '@nestjs/common';
import { USERS_PERMISSTIONS } from 'src/constants/users';

export const Permissions = (...permissions: USERS_PERMISSTIONS[]) =>
  SetMetadata('permissions', permissions);
