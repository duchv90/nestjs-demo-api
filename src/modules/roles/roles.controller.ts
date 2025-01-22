import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/permissions/permissions.guard';
import { RolesService } from 'src/modules/roles/roles.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import {
  CreateRoleDto,
  CreateRolePermissionsDto,
  UpdateRoleDto,
} from 'src/modules/roles/dto/role.dto';
import { PaginationDto } from 'src/modules/dtos/pagination.dto';
import { USERS_PERMISSTIONS } from 'src/constants/users';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Get a list of roles
   *
   * @async
   * @returns {Array} RoleDto[]
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  @Permissions(USERS_PERMISSTIONS.VIEW_ROLES)
  async getRoles(@Query() pagination: PaginationDto) {
    return await this.rolesService.getRoles(pagination);
  }

  /**
   * Get a role by id
   *
   * @async
   * @param {number} id
   * @returns {object} RoleDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  @Permissions(USERS_PERMISSTIONS.VIEW_ROLES)
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.getRole(id);
  }

  /**
   * Create new role
   *
   * @async
   * @param {CreateRoleDto} role
   * @returns {object} RoleDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  @Permissions(USERS_PERMISSTIONS.ADD_ROLES)
  async createPermission(@Body() role: CreateRoleDto) {
    return await this.rolesService.createRole(role);
  }

  /**
   * Update role information
   *
   * @async
   * @param {number} id
   * @param {UpdateRoleDto} updateRoleDto
   * @returns {object} RoleDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id')
  @Permissions(USERS_PERMISSTIONS.UPDATE_ROLES)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.updateRole(id, updateRoleDto);
  }

  /**
   * Delete role
   *
   * @async
   * @param {number} id
   * @returns {object}
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  @Permissions(USERS_PERMISSTIONS.DELETE_ROLES)
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.deleteRole(id);
  }

  /**
   * Update permissions for the roles
   *
   * @async
   * @param {number} id
   * @param {CreateRolePermissionsDto} permissionIds
   * @returns {object}
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(':id/permissions')
  @Permissions(USERS_PERMISSTIONS.UPDATE_ROLES)
  async updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() permissionIds: CreateRolePermissionsDto,
  ) {
    return await this.rolesService.updateRolePermissions(id, permissionIds);
  }
}
