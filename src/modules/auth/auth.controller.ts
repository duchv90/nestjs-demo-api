import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetToken } from 'src/common/decorators/token.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetToken() refreshToken: string) {
    return await this.authService.logout(refreshToken);
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@GetToken() refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Request() req) {
    return await this.authService.verifyUser(req.user);
  }
}
