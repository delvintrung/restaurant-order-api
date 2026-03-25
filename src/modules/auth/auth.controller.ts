import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from '../account/account.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import type { Request, Response } from 'express';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const { username, password } = body;

    const account = await this.accountService.findByUsername(username);
    if (!account) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const user = await this.authService.validateUser(account, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const loginResult = await this.authService.login(user);

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      loginResult.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    return {
      accessToken: loginResult.accessToken,
      user: loginResult.user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Body() body,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE] ?? body?.refreshToken;

    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken);

        await this.accountRepo.update(payload.sub, {
          refreshToken: '',
        });
      } catch {
        // Keep logout idempotent when token is expired/invalid.
      }
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: undefined,
    });

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body) {
    const refreshToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE] ?? body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const account = await this.accountRepo.findOne({
      where: { id: payload.sub },
    });

    if (!account || account.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    const newAccessToken = this.jwtService.sign({
      sub: account.id,
      role: account.role,
      restaurantId: account.restaurantId,
    });

    return {
      accessToken: newAccessToken,
    };
  }
}
