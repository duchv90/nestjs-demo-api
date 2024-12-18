import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { PermissionsGuard } from './permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { USERS_PERMISSTIONS } from 'src/constants/users';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Get list of all permisstions
   *
   * @async
   * @returns {Array} PermissionDto[]
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  @Permissions(USERS_PERMISSTIONS.VIEW_PERMISSIONS)
  async getPermissions() {
    return await this.permissionsService.getPermissions();
  }

  /**
   * Get a permissions by id
   *
   * @async
   * @param {number} id
   * @returns {object} PermissionDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  @Permissions(USERS_PERMISSTIONS.VIEW_PERMISSIONS)
  async getPermissionById(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionsService.getPermission(id);
  }

  /**
   * Create new permission
   *
   * @async
   * @param {CreatePermissionDto} permission
   * @returns {object} PermissionDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  @Permissions(USERS_PERMISSTIONS.ADD_PERMISSIONS)
  async createPermission(@Body() permission: CreatePermissionDto) {
    return await this.permissionsService.createPermissions(permission);
  }

  /**
   * Update permission information
   *
   * @async
   * @param {number} id
   * @param {UpdatePermissionDto} updatePermissionDto
   * @returns {object}
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  @Permissions(USERS_PERMISSTIONS.UPDATE_PERMISSIONS)
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionsService.updatePermission(
      id,
      updatePermissionDto,
    );
  }

  /**
   * Delete permission
   *
   * @async
   * @param {number} id
   * @returns {unknown}
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  @Permissions(USERS_PERMISSTIONS.DELETE_PERMISSIONS)
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionsService.deletePermisstion(id);
  }
}
