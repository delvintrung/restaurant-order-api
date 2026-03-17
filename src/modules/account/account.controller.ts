import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from './decorators/role.decorator';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Tạo tài khoản mới',
    description: 'Chỉ admin mới có quyền tạo tài khoản',
  })
  createAccount(@Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(dto);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }
}
