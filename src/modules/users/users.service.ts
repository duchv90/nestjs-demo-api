import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, UserProfiles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RESPONSE_MESSAGES } from 'src/constants/message';
import { PrismaService } from 'src/core/database/prisma.service';
import { Logger } from 'src/core/logger/logger.service';
import { AuthUser, ResponseData } from 'src/interfaces/global.interface';
import { FormatString } from 'src/utils/string.utils';
import {
  CreateUserDto,
  ProfileDto,
  UpdateUserDto,
  UserDto,
  UserInfoDto,
} from 'src/modules/users/dto/users.dto';
import { PaginationDto } from 'src/modules/dtos/pagination.dto';
import {
  USERS_GENDER,
  USERS_PERMISSTIONS,
  USERS_ROLES,
  USERS_STATUS,
} from 'src/constants/users';

@Injectable()
export class UsersService {
  private readonly LOG_CONTEXT = 'UsersService';
  private readonly USERS_NAME = 'Users';

  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async getUserInfo(user: AuthUser): Promise<ResponseData<object>> {
    try {
      if (user.userId) {
        const userData = await this.prisma.users.findUnique({
          where: { id: user.userId },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
            profile: true,
          },
        });

        // Get all permission name
        const userPermissions: string[] = userData.roles.reduce((acc, ur) => {
          return [
            ...new Set([
              ...acc,
              ...ur.role.permissions.map((rp) => rp.permission.name),
            ]),
          ];
        }, []);

        const data: UserInfoDto = {
          id: userData.id,
          username: userData.username,
          profile: {
            id: userData.profile.id,
            userId: userData.id,
            firstName: userData.profile.firstName,
            lastName: userData.profile.lastName,
            gender: userData.profile.gender,
            birthday: new Date(userData.profile.birthday),
            address: userData.profile.address,
            phone: userData.profile.phone,
            company: userData.profile.company,
            avatarUrl: userData.profile.avatarUrl,
            created: new Date(userData.profile.createdAt),
            updated: new Date(userData.profile.updatedAt),
          },
          created: new Date(userData.createdAt),
          updated: new Date(userData.updatedAt),
          roles: userData.roles.map((ur) => ur.role.name),
          permissions: userPermissions,
        };

        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.GET_SUCCESS,
            `${this.USERS_NAME} with username: ${userData.username}`,
          ),
          data: data,
        };
      }

      throw new BadRequestException(
        FormatString(RESPONSE_MESSAGES.RESOUCE_NOT_FOUND, this.USERS_NAME),
      );
    } catch (error) {
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUser(where: Prisma.UsersWhereUniqueInput) {
    try {
      return await this.prisma.users.findUnique({
        where: where,
      });
    } catch (error) {
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsers(pagination: PaginationDto): Promise<ResponseData<object>> {
    try {
      // Get all users from Database. Update filtering and sorting (https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-by-relation)
      const { page, pageSize } = pagination;
      const skip = (page - 1) * pageSize;
      const users = await this.prisma.users.findMany({
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          profile: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      const usersCount = await this.prisma.users.count();

      const data: UserDto[] = users.map((entity) => this.mapToUsersDto(entity));

      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.GET_LIST_SUCCESS,
          this.USERS_NAME,
        ),
        data: {
          users: data,
          page: page,
          pageSize: pageSize,
          total: usersCount,
        },
      };
    } catch (error) {
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersById(id: number): Promise<ResponseData<object>> {
    try {
      const users = await this.prisma.users.findUnique({
        where: { id: id },
        include: {
          profile: true,
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (users) {
        const data: UserDto = this.mapToUsersDto(users);
        return {
          success: true,
          message: '',
          data: data,
        };
      } else {
        throw new BadRequestException({
          custom: true,
          message: FormatString(
            RESPONSE_MESSAGES.RESOUCE_NOT_FOUND,
            this.USERS_NAME,
          ),
          statusCode: 400,
        });
      }
    } catch (error) {
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      if (error.response && error.response.custom) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<ResponseData<object>> {
    try {
      const saltRounds: number = parseInt(
        process.env.ENCRYPTION_SALT_ROUNDS,
        10,
      );
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
      const gender: number = USERS_GENDER[createUserDto.gender]
        ? USERS_GENDER[createUserDto.gender].value
        : USERS_GENDER[0].value;
      const users = await this.prisma.users.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          password: hashedPassword,
          status: USERS_STATUS.ACTIVE,
          profile: {
            create: {
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName || '',
              gender: gender,
              birthday: createUserDto.birthday
                ? new Date(createUserDto.birthday)
                : null,
              address: createUserDto.address || '',
              phone: createUserDto.phone || '',
              company: createUserDto.company || '',
              avatarUrl: createUserDto.avatarUrl || '',
            },
          },
        },
      });
      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.CREATE_SUCCESS,
          this.USERS_NAME,
        ),
        data: { ...users },
      };
    } catch (error) {
      this.logger.log('Create user error: ' + error.message, this.LOG_CONTEXT);
      if (error.response.custom) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseData<object>> {
    try {
      const user = await this.getUser({ id: id });

      if (user && bcrypt.compareSync(updateUserDto.password, user.password)) {
        const gender: number = USERS_GENDER[updateUserDto.gender]
          ? USERS_GENDER[updateUserDto.gender].value
          : USERS_GENDER[0].value;
        const updateUser = await this.prisma.users.update({
          where: { id: id },
          data: {
            username: updateUserDto.username,
            email: updateUserDto.email,
            profile: {
              update: {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName || '',
                gender: gender,
                birthday: updateUserDto.birthday
                  ? new Date(updateUserDto.birthday)
                  : null,
                address: updateUserDto.address || '',
                phone: updateUserDto.phone || '',
                company: updateUserDto.company || '',
                avatarUrl: updateUserDto.avatarUrl || '',
              },
            },
          },
          include: { profile: true },
        });

        const data: UserDto = this.mapToUsersDto(updateUser);
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.UPDATE_SUCCESS,
            this.USERS_NAME,
          ),
          data: data,
        };
      } else {
        throw new BadRequestException({
          custom: true,
          message: FormatString(RESPONSE_MESSAGES.PASSWORD_NOT_MATCH),
          statusCode: 400,
        });
      }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          FormatString(
            RESPONSE_MESSAGES.UNIQUE_CONSTRAINT_FAILED,
            error.meta?.target,
          ),
        );
      }
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      if (error.response.custom) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(id: number): Promise<ResponseData<object>> {
    try {
      const user = await this.prisma.users.delete({
        where: { id: id },
      });

      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.DELETE_SUCCESS,
          this.USERS_NAME,
          id,
        ),
        data: { username: user.username },
      };
    } catch (error) {
      this.logger.log('Users delete error: ' + error.message, this.LOG_CONTEXT);
      if (error.response.custom) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getProfile(id: number): Promise<ResponseData<object>> {
    try {
      const profile: UserProfiles = await this.prisma.userProfiles.findUnique({
        where: { userId: id },
      });

      // End points
      const data: ProfileDto = {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName || '',
        gender: profile.gender,
        birthday: profile.birthday ? new Date(profile.birthday) : null,
        address: profile.address || '',
        phone: profile.phone || '',
        company: profile.company || '',
        avatarUrl: profile.avatarUrl || '',
        created: new Date(profile.createdAt),
        updated: new Date(profile.updatedAt),
      };

      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.GET_SINGLE_SUCCESS,
          this.USERS_NAME,
        ),
        data: data,
      };
    } catch (error) {
      this.logger.log('Users fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserRoles(id: number): Promise<string[]> {
    try {
      const userRoles = await this.prisma.userRoles.findMany({
        where: { userId: id },
        include: {
          role: true,
        },
      });

      return userRoles.map((ur) => ur.role.name);
    } catch {
      return [];
    }
  }

  async hasPermission(
    id: number,
    permissions: USERS_PERMISSTIONS[],
  ): Promise<boolean> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: id },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const userRoles: string[] = user.roles.map((ur) => ur.role.name);

      if (userRoles.includes(USERS_ROLES.SUPER_ADMIN)) return true;

      // Get all permissions of current user
      const userPermissions: string[] = user.roles.reduce((acc, ur) => {
        return [
          ...new Set([
            ...acc,
            ...ur.role.permissions.map((rp) => rp.permission.name),
          ]),
        ];
      }, []);

      // Check if user has any permissions for route
      return permissions.some((p) => userPermissions.includes(p));
    } catch {
      return false;
    }
  }

  mapToUsersDto(userEntity: any): UserDto {
    if (!userEntity) return null;
    return {
      id: userEntity.id,
      userId: userEntity.id,
      username: userEntity.username,
      email: userEntity.email,
      firstName: userEntity.profile.firstName,
      lastName: userEntity.profile.lastName,
      gender: userEntity.profile.gender,
      birthday: userEntity.profile.birthday
        ? new Date(userEntity.profile.birthday)
        : null,
      address: userEntity.profile.address || '',
      phone: userEntity.profile.phone || '',
      company: userEntity.profile.company || '',
      avatarUrl: userEntity.profile.avatarUrl || '',
      status: userEntity.status,
      created: new Date(userEntity.createdAt),
      updated: new Date(userEntity.updatedAt),
      roles: userEntity.roles?.map((ur) => ur.role.name) || [],
      rolesIds: userEntity.roles?.map((ur) => ur.role.id) || [],
      permissions:
        userEntity.roles?.reduce((acc, ur) => {
          return [
            ...new Set([
              ...acc,
              ...(ur.role?.permissions?.map((rp) => rp.permission.name) || []),
            ]),
          ];
        }, []) || [],
      permissionsIds:
        userEntity.roles?.reduce((acc, ur) => {
          return [
            ...new Set([
              ...acc,
              ...(ur.role?.permissions?.map((rp) => rp.permission.id) || []),
            ]),
          ];
        }, []) || [],
    };
  }
}
