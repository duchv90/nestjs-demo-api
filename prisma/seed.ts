import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { USERS_PERMISSTIONS } from '../src/constants/users';
const prisma = new PrismaClient();

async function main() {
  try {
    const username: string = process.env.SUPER_ADMIN_USERNAME;
    const password: string = process.env.ENCRYPTION_PASS_DEFAULT;
    const saltRounds: number = parseInt(process.env.ENCRYPTION_SALT_ROUNDS, 10);
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);

    // Admin
    const user = await prisma.users.create({
      data: {
        username: username,
        email: username,
        password: hashedPassword,
      },
    });

    // Admin profile
    await prisma.userProfiles.create({
      data: {
        userId: user.id,
        firstName: 'Đức',
        lastName: 'Hoàng',
        gender: 1,
      },
    });

    // Roles
    const roleSuperAdmin = await prisma.roles.create({
      data: {
        name: 'SuperAdmin',
        description: 'Administrator',
      },
    });

    await prisma.roles.create({
      data: {
        name: 'Admin',
        description: 'Admin',
      },
    });

    // Users - Roles
    await prisma.userRoles.create({
      data: {
        userId: user.id,
        roleId: roleSuperAdmin.id,
      },
    });

    // Permissions - Assigned for SuperAdmin
    const permissions: USERS_PERMISSTIONS[] = [
      USERS_PERMISSTIONS.VIEW_USERS,
      USERS_PERMISSTIONS.VIEW_ROLES,
      USERS_PERMISSTIONS.VIEW_PERMISSIONS,
      USERS_PERMISSTIONS.ADD_USERS,
      USERS_PERMISSTIONS.ADD_ROLES,
      USERS_PERMISSTIONS.ADD_PERMISSIONS,
      USERS_PERMISSTIONS.UPDATE_USERS,
      USERS_PERMISSTIONS.UPDATE_ROLES,
      USERS_PERMISSTIONS.UPDATE_PERMISSIONS,
      USERS_PERMISSTIONS.DELETE_USERS,
      USERS_PERMISSTIONS.DELETE_ROLES,
      USERS_PERMISSTIONS.DELETE_PERMISSIONS,
    ];

    const promissionsIds = await Promise.all(
      permissions.map(async (permission) => {
        const p = await prisma.permissions.create({
          data: {
            name: permission,
            description: '',
          },
        });

        return p.id;
      }),
    );

    promissionsIds.map(async (permissionId) => {
      await prisma.rolePermissions.create({
        data: {
          roleId: roleSuperAdmin.id,
          permissionId: permissionId,
        },
      });
    });
  } catch (error) {
    throw new Error('Error seeding data: ' + error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
