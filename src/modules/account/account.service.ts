import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountRepository } from 'src/repositories/account.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';
import { CurrentUserDto } from './dto/current-user.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepo: Repository<AccountEntity>,
    private readonly jwtService: JwtService,
    private readonly actionLogService: ActionLogService,
  ) {}

  async createAccount(dto: CreateAccountDto, currentUser: CurrentUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const account = this.accountRepo.create({
      ...dto,
      password: hash,
      createdBy: 'admin',
    });

    const newAccount = await this.accountRepo.save(account);

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'CREATE_ACCOUNT',
      description: `Tạo tài khoản mới: ${newAccount.username}`,
    };

    await this.actionLogService.create(actionLogDto, currentUser);

    const { password, ...result } = newAccount;

    return result;
  }

  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    currentUser: CurrentUserDto,
  ) {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    if (dto.restaurantId) {
      account.restaurantId = dto.restaurantId;
    }
    if (dto.username) {
      account.username = dto.username;
    }

    const updatedAccount = await this.accountRepo.save(account);

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'UPDATE_ACCOUNT',
      description: `Cập nhật tài khoản: ${updatedAccount.username}`,
    };

    await this.actionLogService.create(actionLogDto, currentUser);

    const { password, refreshToken, ...result } = updatedAccount;

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
