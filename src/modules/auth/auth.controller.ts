import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from '../account/account.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/account.entity';

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
  async login(@Body() body) {
    const { username, password } = body;

    const account = await this.accountService.findByUsername(username);

    const user = await this.authService.validateUser(account, password);

    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body) {
    const { refreshToken } = body;

    const payload = this.jwtService.verify(refreshToken);

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
