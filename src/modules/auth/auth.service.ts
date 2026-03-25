// auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  async validateUser(account, password: string) {
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) return null;

    return account;
  }

  async login(account) {
    const payload = {
      sub: account.id,
      role: account.role,
      restaurantId: account.restaurantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.accountRepo.update(account.id, {
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: account,
    };
  }
}
