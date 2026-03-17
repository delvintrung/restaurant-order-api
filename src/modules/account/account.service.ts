import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountRepository } from 'src/repositories/account.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepo: Repository<AccountEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(dto: CreateAccountDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const account = this.accountRepo.create({
      ...dto,
      password: hash,
      createdBy: 'admin',
    });

    const newAccount = await this.accountRepo.save(account);

    const { password, ...result } = newAccount;

    return result;
  }

  async findByUsername(username: string) {
    return this.accountRepo
      .createQueryBuilder('account')
      .addSelect('account.password')
      .where('account.username = :username', { username })
      .getOne();
  }

  async findAll() {
    return this.accountRepo.find();
  }
}
