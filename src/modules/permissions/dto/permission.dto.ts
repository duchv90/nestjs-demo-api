import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class PermissionDto {
  id: number;
  name: string;
  description?: string;
  created: Date;
  updated: Date;
}

export class FindOneParams {
  @IsNotEmpty()
  @IsNumberString()
  id: number;
}

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'name is required.' })
  @IsString({ message: 'name must be a string.' })
  name: string;

  @IsString({ message: 'description must be a string.' })
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString({ message: 'name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string.' })
  description?: string;
}
