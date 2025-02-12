import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { Logger } from 'src/core/logger/logger.service';
import { PrismaService } from 'src/core/database/prisma.service';
import { ResponseData, AuthUser } from 'src/interfaces/global.interface';
import { JWT_CONSTANTS, LOGIN_STATUS } from 'src/constants/auth';
import { USERS_STATUS } from 'src/constants/users';
import { RESPONSE_MESSAGES } from 'src/constants/message';
import { FormatString } from 'src/utils/string.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  generateAccessToken(payload: AuthUser) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: AuthUser) {
    return this.jwtService.sign(payload, {
      secret: JWT_CONSTANTS.REFRESH_SECRET,
      expiresIn: JWT_CONSTANTS.REFRESH_EXPIRES_IN,
    });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.getUser({
        username: username,
      });

      if (!user)
        return {
          user: null,
          status: LOGIN_STATUS.USER_NOT_FOUND,
          message: RESPONSE_MESSAGES.USER_NOT_FOUND,
        };

      if (user && bcrypt.compareSync(pass, user.password)) {
        if (user.status === USERS_STATUS.ACTIVE) {
          return {
            user: {
              userId: user.id,
              username: user.username,
            },
            status: LOGIN_STATUS.SUCCESS,
            message: FormatString(
              RESPONSE_MESSAGES.GET_SINGLE_SUCCESS,
              user.username,
            ),
          };
        }
        return {
          user: null,
          status: LOGIN_STATUS.ACCOUNT_LOCKED,
          message: RESPONSE_MESSAGES.USER_NOT_ACTIVE,
        };
      } else {
        return {
          user: null,
          status: LOGIN_STATUS.WRONG_PASSWORD,
          message: RESPONSE_MESSAGES.WRONG_USER_PASSWORD,
        };
      }
    } catch {
      return {
        user: null,
        status: LOGIN_STATUS.SERVER_ERROR,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  }

  verifyToken(token: string, secret?: string) {
    try {
      return this.jwtService.verify(token, {
        secret: secret || JWT_CONSTANTS.SECRET,
      });
    } catch (err) {
      this.logger.error(`Token ${token} verification failed: ${err.message}`);
      return null;
    }
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    try {
      const expirationTime = this.jwtService.decode(refreshToken)['exp'];
      const expiresAt = new Date(expirationTime * 1000);

      await this.prisma.refreshToken.upsert({
        where: { token: refreshToken },
        update: {
          isActive: true,
          expiresAt: expiresAt,
        },
        create: {
          userId: userId,
          token: refreshToken,
          expiresAt: expiresAt,
        },
      });
    } catch (error) {
      this.logger.log('Unable to save refresh token: ', error.message);
    }
  }

  async deleteRefreshToken(refreshToken: string) {
    try {
      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.log('Unable to delete refresh token: ', error.message);
    }
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    try {
      const now = new Date();
      const token = await this.prisma.refreshToken.findUnique({
        where: {
          userId: userId,
          token: refreshToken,
          isActive: true,
          expiresAt: {
            gt: now,
          },
        },
      });

      if (token) return true;
      return false;
    } catch (error) {
      this.logger.log('Refresh token not found: ', error.message);
      return false;
    }
  }

  // Controller service
  async login(user: AuthUser): Promise<ResponseData<object>> {
    try {
      if (user.username && user.userId) {
        const payload = { username: user.username, userId: user.userId };
        const accessToken: string = await this.generateAccessToken(payload);
        const refreshToken: string = await this.generateRefreshToken(payload);
        await this.saveRefreshToken(user.userId, refreshToken);
        return {
          success: true,
          message: 'Token created successfully',
          data: {
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        };
      } else {
        return {
          success: false,
          message: 'Invalid request',
        };
      }
    } catch (error) {
      this.logger.log(
        `[LoginError] Username: ${user.username} - ${error.message}`,
        'Login-Controller',
      );
      return {
        success: false,
        message: `An unexpected error occurred: ${error.message}`,
      };
    }
  }

  async logout(refreshToken: string): Promise<ResponseData<object>> {
    try {
      await this.deleteRefreshToken(refreshToken);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch {
      return {
        success: false,
        message: 'Invalid request',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ResponseData<object>> {
    try {
      const user = this.verifyToken(refreshToken, JWT_CONSTANTS.REFRESH_SECRET);
      if (user && 'userId' in user && 'username' in user) {
        const userId = parseInt(user.userId, 10);
        const valid = await this.validateRefreshToken(userId, refreshToken);
        if (valid) {
          const payload = { username: user.username, userId: user.userId };
          const accessToken: string = await this.generateAccessToken(payload);
          const newRefreshToken: string =
            await this.generateRefreshToken(payload);
          await this.deleteRefreshToken(refreshToken);
          await this.saveRefreshToken(user.userId, newRefreshToken);

          return {
            success: true,
            message: 'Access token refreshed successfully',
            data: {
              access_token: accessToken,
              refresh_token: newRefreshToken,
            },
          };
        }
      }

      return {
        success: false,
        message: 'Invalid refresh token',
      };
    } catch {
      return {
        success: false,
        message: 'Invalid request',
      };
    }
  }

  async verifyUser(user: AuthUser): Promise<ResponseData<object>> {
    try {
      const userData = await this.prisma.users.findUnique({
        where: { id: user.userId },
      });
      if (userData) {
        return {
          success: true,
          message: 'Authentication successful',
          data: {
            authenticated: true,
          },
        };
      } else {
        return {
          success: false,
          message: 'Authentication failed',
          data: {
            authenticated: false,
          },
        };
      }
    } catch {
      return {
        success: false,
        message: 'Authentication failed',
        data: {
          authenticated: false,
        },
      };
    }
  }
}
