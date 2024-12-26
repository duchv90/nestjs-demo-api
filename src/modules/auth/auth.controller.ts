import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { GetToken } from 'src/common/decorators/token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetToken() refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshAccessToken(@GetToken() refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
