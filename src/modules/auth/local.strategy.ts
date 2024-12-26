import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const { user, status, message } = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException({
        success: true,
        message: message,
        data: {
          statusCode: 401,
          status: status,
        }
      });
    }
    return user;
  }
}
