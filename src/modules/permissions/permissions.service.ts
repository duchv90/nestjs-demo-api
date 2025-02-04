import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permissions, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { Logger } from 'src/core/logger/logger.service';
import { ResponseData } from 'src/interfaces/global.interface';
import { FormatString } from 'src/utils/string.utils';
import {
  CreatePermissionDto,
  PermissionDto,
  UpdatePermissionDto,
} from 'src/modules/permissions/dto/permission.dto';
import { PaginationDto } from 'src/modules/dtos/pagination.dto';
import { RESPONSE_MESSAGES } from 'src/constants/message';

@Injectable()
export class PermissionsService {
  private readonly LOG_CONTEXT = 'PermissionsService';
  private readonly PERMISSIONS_NAME = 'Permissions';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async getPermissions(
    pagination: PaginationDto,
  ): Promise<ResponseData<object>> {
    try {
      // Get all permissions from Database. Update filtering and sorting (https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-by-relation)
      const { page, pageSize } = pagination;
      const skip = (page - 1) * pageSize;
      const permissions: any = await this.prisma.permissions.findMany({
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      });

      const permissionsCount = await this.prisma.permissions.count();

      const data: PermissionDto[] = permissions.map((entity: Permissions) => ({
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
          this.PERMISSIONS_NAME,
        ),
        data: {
          permissions: data,
          page: page,
          pageSize: pageSize,
          total: permissionsCount,
        },
      };
    } catch (error) {
      this.logger.log(
        'Permissions fetch error: ' + error.message,
        this.LOG_CONTEXT,
      );
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPermission(id: number): Promise<ResponseData<object>> {
    try {
      const permission: Permissions = await this.prisma.permissions.findUnique({
        where: { id: id },
      });

      if (permission) {
        const data: PermissionDto = {
          id: permission.id,
          name: permission.name,
          description: permission.description || '',
          created: new Date(permission.createdAt),
          updated: new Date(permission.updatedAt),
        };
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.GET_SINGLE_SUCCESS,
            this.PERMISSIONS_NAME,
          ),
          data: data,
        };
      } else {
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.RESOUCE_NOT_FOUND,
            this.PERMISSIONS_NAME,
          ),
          data: { isEmpty: true },
        };
      }
    } catch (error) {
      this.logger.log(
        'Permission fetch error: ' + error.message,
        this.LOG_CONTEXT,
      );
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async createPermissions(
    permission: CreatePermissionDto,
  ): Promise<ResponseData<object>> {
    try {
      const data: Prisma.PermissionsCreateInput = {
        name: permission.name,
        description: permission.description || '',
      };
      const newPermission: Permissions = await this.prisma.permissions.create({
        data: data,
      });
      if (newPermission) {
        const newData: PermissionDto = {
          id: newPermission.id,
          name: newPermission.name,
          description: newPermission.description,
          created: new Date(newPermission.createdAt),
          updated: new Date(newPermission.updatedAt),
        };
        return {
          success: true,
          message: FormatString(
            RESPONSE_MESSAGES.CREATE_SUCCESS,
            this.PERMISSIONS_NAME,
          ),
          data: newData,
        };
      } else {
        this.logger.log(
          '[CreatePermission] Permission create error.',
          this.LOG_CONTEXT,
        );
        throw new BadRequestException(
          FormatString(RESPONSE_MESSAGES.CREATE_FAIL, this.PERMISSIONS_NAME),
        );
      }
    } catch (error) {
      this.logger.log(
        'Permission create error: ' + error.message,
        this.LOG_CONTEXT,
      );
      if (error.code === 'P2002') {
        throw new BadRequestException(
          FormatString(RESPONSE_MESSAGES.CREATE_UNIQUE, this.PERMISSIONS_NAME),
        );
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePermission(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<ResponseData<object>> {
    try {
      // Mapping data
      const data: Prisma.PermissionsUpdateInput = {};
      if ('name' in updatePermissionDto) data.name = updatePermissionDto.name;
      if ('description' in updatePermissionDto)
        data.description = updatePermissionDto.description;
      const permisstion: Permissions = await this.prisma.permissions.update({
        where: { id: id },
        data: data,
      });
      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.UPDATE_SUCCESS,
          this.PERMISSIONS_NAME,
        ),
        data: {
          permisstionId: permisstion.id,
          name: permisstion.name,
          description: permisstion.description,
        },
      };
    } catch (error) {
      this.logger.log(
        'Permission update error: ' + error.message,
        this.LOG_CONTEXT,
      );
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            FormatString(
              RESPONSE_MESSAGES.UPDATE_NOT_FOUND,
              this.PERMISSIONS_NAME,
              id,
            ),
          );
        case 'P2002':
          throw new BadRequestException(
            FormatString(RESPONSE_MESSAGES.UPDATE_FAIL, this.PERMISSIONS_NAME),
          );
        default:
          throw new BadRequestException(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  async deletePermisstion(id: number): Promise<ResponseData<object>> {
    try {
      const deletePermission: Permissions =
        await this.prisma.permissions.delete({
          where: { id: id },
        });
      return {
        success: true,
        message: FormatString(
          RESPONSE_MESSAGES.DELETE_SUCCESS,
          this.PERMISSIONS_NAME,
          deletePermission.id,
        ),
        data: {},
      };
    } catch (error) {
      this.logger.log(
        'Permission delete error: ' + error.message,
        this.LOG_CONTEXT,
      );
      if (error.code === 'P2025') {
        throw new NotFoundException(
          FormatString(
            RESPONSE_MESSAGES.DELETE_NOT_FOUND,
            this.PERMISSIONS_NAME,
            id,
          ),
        );
      }
      throw new BadRequestException(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}
