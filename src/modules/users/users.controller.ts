import {
  Controller,
  UseGuards,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/modules/users/super-admin.guard';
import { PermissionsGuard } from 'src/modules/permissions/permissions.guard';
import { UsersService } from 'src/modules/users/users.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { CreateUserDto, UpdateUserDto } from 'src/modules/users/dto/users.dto';
import { PaginationDto } from 'src/modules/dtos/pagination.dto';
import { USERS_PERMISSTIONS } from 'src/constants/users';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   *
   * @async
   * @returns {object} UserDto
   */
  @UseGuards(JwtAuthGuard)
  @Get('/info')
  async getUserInfo(@Request() req) {
    return await this.usersService.getUserInfo(req.user);
  }

  /**
   * Get a list of users
   * Permissions: view_users
   *
   * @async
   * @returns {UserDto[]}
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  @Permissions(USERS_PERMISSTIONS.VIEW_USERS)
  async getUsers(@Query() pagination: PaginationDto) {
    return await this.usersService.getUsers(pagination);
  }

  /**
   * Get user by id
   * Permissions: update_users
   * SuperAdminGuard: Restrict SuperAdmin's access to information
   *
   * @async
   * @param {number} id
   * @returns {object} UserDto
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard, PermissionsGuard)
  @Get(':id')
  @Permissions(USERS_PERMISSTIONS.UPDATE_USERS)
  async getUsersById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUsersById(id);
  }

  /**
   * Add new a user
   * Permissions: create_users
   *
   * @async
   * @param {CreateUserDto} createUserDto
   * @returns {object} UserDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  @Permissions(USERS_PERMISSTIONS.ADD_USERS)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  /**
   * Update user profile
   * Permissions: update_users
   * SuperAdminGuard: Restrict SuperAdmin's access to information
   *
   * @async
   * @param {number} id
   * @param {UpdateUserDto} updateUserDto
   * @returns {object} UserDto
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard, PermissionsGuard)
  @Patch(':id')
  @Permissions(USERS_PERMISSTIONS.UPDATE_USERS)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  /**
   * Get user profile
   * Permissions: view_users
   *
   * @async
   * @param {number} id
   * @returns {object} ProfileDto
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id/profile')
  @Permissions(USERS_PERMISSTIONS.VIEW_USERS)
  async getProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getProfile(id);
  }

  /**
   * Delete user
   *
   * @async
   * @param {number} id
   * @returns {object} ResponseData
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard, PermissionsGuard)
  @Delete(':id')
  @Permissions(USERS_PERMISSTIONS.DELETE_USERS)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteUser(id);
  }
}
