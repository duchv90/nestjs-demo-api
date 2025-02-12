import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsMatch } from 'src/common/decorators/matches.decorator';

export class ProfileDto {
  id: number;
  userId: number;
  firstName: string;
  lastName?: string;
  gender: number;
  birthday?: Date;
  address?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  created: Date;
  updated: Date;
}

export class UserDto extends ProfileDto {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: string[];
  rolesIds: number[];
  permissions: string[];
  permissionsIds: number[];
}

export class UserInfoDto {
  id: number;
  username: string;
  profile: ProfileDto;
  created: Date;
  updated: Date;
  roles: string[];
  permissions: string[];
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @IsNumber()
  gender: number;

  @IsOptional()
  birthday?: Date;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsStrongPassword()
  @IsMatch('password', {
    message: 'Password confirmation does not match password.',
  })
  passwordConfirmation: string;

  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @IsNumber()
  gender: number;

  @IsOptional()
  birthday?: Date;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
