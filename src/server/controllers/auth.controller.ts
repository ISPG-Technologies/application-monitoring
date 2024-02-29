import {
  Controller,
  Request,
  Post,
  UseGuards,
  Inject,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthRequest, JwtAuthGuard } from '../auth';
import { User } from '../entities';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  @Inject() private authService: AuthService;

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: AuthRequest,
  ): Promise<ApiResponse<{ access_token: string }>> {
    const data = await this.authService.login(req.user);
    return { data, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthRequest): Promise<ApiResponse<User>> {
    return { data: req.user, status: HttpStatus.OK };
  }
}
