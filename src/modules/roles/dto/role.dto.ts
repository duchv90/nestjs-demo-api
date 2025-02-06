import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoleDto {
  id: number;
  name: string;
  description?: string;
  created: Date;
  updated: Date;
}

export class CreateRoleDto {
  @IsNotEmpty({ message: 'name is required.' })
  @IsString({ message: 'name must be a string.' })
  name: string;

  @IsString({ message: 'description must be a string.' })
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string.' })
  description?: string;

  @IsArray()
  @IsOptional()
  permissionIds?: number[];
}

export class RolePermissionsDto {
  id: number;
  roleId: number;
  permissionId: number;
  permissionName?: string;
  permissionDescription?: string;
}

export class CreateRolePermissionsDto {
  @IsArray()
  @IsOptional()
  permissionIds?: number[];
}

export class RoleDetailsDto extends RoleDto {
  permissions: RolePermissionsDto[];
}
