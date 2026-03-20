import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from './decorators/role.decorator';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { CurrentUserDto } from './dto/current-user.dto';

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
  createAccount(
    @Body() dto: CreateAccountDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.accountService.createAccount(dto, currentUser);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản' })
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.accountService.updateAccount(id, dto, currentUser);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }
}
