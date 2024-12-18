import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Roles } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { Logger } from 'src/core/logger/logger.service';
import { ResponseData } from 'src/interfaces/global.interface';
import { RESPONSE_MESSAGES } from 'src/constants/message';
import { FormatString } from 'src/utils/string.utils';
import {
  CreateRoleDto,
  CreateRolePermissionsDto,
  RoleDetailsDto,
  RoleDto,
  RolePermissionsDto,
  UpdateRoleDto,
} from './dto/role.dto';

@Injectable()
export class RolesService {
  private readonly LOG_CONTEXT = 'RolesService';
  private readonly ROLES_NAME = 'Roles';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  /**
   * Get list of roles
   *
   * @async
   * @returns {Promise<ResponseData<object>>}
   */
  async getRoles(): Promise<ResponseData<object>> {
    try {
      // Get all roles from Database. Update filtering and sorting (https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-by-relation)
      const roles: any = await this.prisma.roles.findMany();
      const data: RoleDto[] = roles.map((entity: Roles) => ({
        id: entity.id,
        name: entity.name,
        description: entity.description || '',
        created: new Date(entity.createdAt),
        updated: new Date(entity.updatedAt),
      }));

      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.GET_LIST_SUCCESS,
          this.ROLES_NAME,
        ),
        data: data,
      };
    } catch (error) {
      this.logger.log('Roles fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get role details
   *
   * @async
   * @param {number} id
   * @returns {Promise<ResponseData<object>>}
   */
  async getRole(id: number): Promise<ResponseData<object>> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { id: id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (role) {
        // Endpoints
        const data: RoleDetailsDto = {
          id: role.id,
          name: role.name,
          description: role.description,
          created: new Date(role.createdAt),
          updated: new Date(role.updatedAt),
          permissions: role.permissions.map((rp) => ({
            id: rp.id,
            roleId: rp.roleId,
            permissionId: rp.permissionId,
            permissionName: rp.permission?.name,
            permissionDescription: rp.permission?.description,
          })),
        };
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.GET_SINGLE_SUCCESS,
            this.ROLES_NAME,
          ),
          data: data,
        };
      } else {
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.RESOUCE_NOT_FOUND,
            this.ROLES_NAME,
          ),
          data: { isEmpty: true },
        };
      }
    } catch (error) {
      this.logger.log('Role fetch error: ' + error.message, this.LOG_CONTEXT);
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create new role
   *
   * @async
   * @param {CreateRoleDto} role
   * @returns {Promise<ResponseData<object>>}
   */
  async createRole(role: CreateRoleDto): Promise<ResponseData<object>> {
    try {
      const data: Prisma.RolesCreateInput = {
        name: role.name,
        description: role.description || '',
      };
      const newRole: Roles = await this.prisma.roles.create({
        data: data,
      });
      if (newRole) {
        // Endpoints
        const newData: RoleDto = {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description,
          created: new Date(newRole.createdAt),
          updated: new Date(newRole.updatedAt),
        };
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.CREATE_SUCCESS,
            this.ROLES_NAME,
          ),
          data: newData,
        };
      } else {
        this.logger.log('[CreateRole] Role create error.', this.LOG_CONTEXT);
      }
    } catch (error) {
      this.logger.log('Role create error: ' + error.message, this.LOG_CONTEXT);
      if (error.code === 'P2002') {
        throw new BadRequestException(
          FormatString(RESPONSE_MESSAGES.CREATE_UNIQUE, this.ROLES_NAME),
        );
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update role
   *
   * @async
   * @param {number} id
   * @param {UpdateRoleDto} updateRoleDto
   * @returns {Promise<ResponseData<object>>}
   */
  async updateRole(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ResponseData<object>> {
    try {
      // Mapping data
      const data: Prisma.RolesUpdateInput = {};
      if ('name' in updateRoleDto) data.name = updateRoleDto.name;
      if ('description' in updateRoleDto)
        data.description = updateRoleDto.description;
      const role: Roles = await this.prisma.roles.update({
        where: { id: id },
        data: data,
      });
      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.UPDATE_SUCCESS,
          this.ROLES_NAME,
        ),
        data: {
          roleId: role.id,
          name: role.name,
          description: role.description,
        },
      };
    } catch (error) {
      this.logger.log('Role update error: ' + error.message, this.LOG_CONTEXT);
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            FormatString(
              RESPONSE_MESSAGES.UPDATE_NOT_FOUND,
              this.ROLES_NAME,
              id,
            ),
          );
        case 'P2002':
          throw new BadRequestException(
            FormatString(RESPONSE_MESSAGES.UPDATE_FAIL, this.ROLES_NAME),
          );
        default:
          throw new BadRequestException(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  /**
   * Delete role
   *
   * @async
   * @param {number} id
   * @returns {Promise<ResponseData<object>>}
   */
  async deleteRole(id: number): Promise<ResponseData<object>> {
    try {
      const deleteRole: Roles = await this.prisma.roles.delete({
        where: { id: id },
      });
      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.DELETE_SUCCESS,
          this.ROLES_NAME,
          deleteRole.id,
        ),
        data: {},
      };
    } catch (error) {
      this.logger.log('Role delete error: ' + error.message, this.LOG_CONTEXT);
      if (error.code === 'P2025') {
        throw new NotFoundException(
          FormatString(RESPONSE_MESSAGES.DELETE_NOT_FOUND, this.ROLES_NAME, id),
        );
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Assign permission for roles
   *
   * @async
   * @param {number} id RoleId
   * @param {CreateRolePermissionsDto} permissionIds List of permissions assigned to the role
   * @returns {Promise<ResponseData<object>>}
   */
  async updateRolePermissions(
    id: number,
    rolePermissionDto: CreateRolePermissionsDto,
  ): Promise<ResponseData<object>> {
    try {
      // Fetch the current permissions for the role
      const role = await this.prisma.roles.findUnique({
        where: { id: id },
        include: { permissions: true },
      });

      if (!role) {
        throw new BadRequestException({
          custom: true,
          message: FormatString(
            RESPONSE_MESSAGES.RESOUCE_NOT_FOUND,
            this.ROLES_NAME,
          ),
          statusCode: 400,
        });
      }
      const { permissionIds } = rolePermissionDto;

      // Get current permission IDs
      const permissions: RolePermissionsDto[] = role.permissions || [];

      // Determine which permissions to disconnect (remove)
      const permissionsToDisconnect = permissions.filter(
        (permission) => !permissionIds.includes(permission.permissionId),
      );

      // Determine which permissions to connect (add)
      const permissionsToConnect = permissionIds.filter((id) => {
        return !permissions.some(
          (permission) => permission.permissionId === id,
        );
      });

      // Check if all permissions exist before add record to RolePermissions
      const existingPermissions = await this.prisma.permissions.findMany({
        where: {
          id: { in: permissionsToConnect },
        },
      });

      if (existingPermissions.length !== permissionsToConnect.length) {
        throw new BadRequestException({
          custom: true,
          message: FormatString(
            RESPONSE_MESSAGES.UPDATE_FOREIGN_KEY_NOT_EXIST,
            'permissions',
          ),
          statusCode: 400,
        });
      }

      // Delete and create RolePermissions
      const roles = await this.prisma.roles.update({
        where: { id: id },
        data: {
          permissions: {
            deleteMany: permissionsToDisconnect.map((permission) => ({
              id: permission.id,
            })),
            createMany: {
              data: permissionsToConnect.map((permissionId) => ({
                permissionId,
              })),
            },
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      // Endpoints
      const data: RoleDetailsDto = {
        id: roles.id,
        name: roles.name,
        description: roles.description,
        created: new Date(roles.createdAt),
        updated: new Date(roles.updatedAt),
        permissions: roles.permissions.map((rp) => ({
          id: rp.id,
          roleId: rp.roleId,
          permissionId: rp.permissionId,
          permissionName: rp.permission?.name,
          permissionDescription: rp.permission?.description,
        })),
      };

      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.UPDATE_SUCCESS,
          'RolePermissions',
        ),
        data: data,
      };
    } catch (error) {
      this.logger.log(
        'Assign permission for roles error: ' + error.message,
        this.LOG_CONTEXT,
      );
      if (error.response.custom) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}
