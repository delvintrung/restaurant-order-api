import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../account/decorators/role.decorator';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { AccountEntity } from 'src/entities/account.entity';

@Controller('restaurants')
@ApiTags('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Thêm nhà hàng mới' })
  create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() user: AccountEntity,
  ) {
    return this.restaurantService.create(createRestaurantDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách nhà hàng' })
  findAll(@CurrentUser() user: AccountEntity) {
    return this.restaurantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một nhà hàng' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @ApiOperation({ summary: 'Cập nhật thông tin nhà hàng' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() user: AccountEntity,
  ) {
    return this.restaurantService.update(id, updateRestaurantDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa nhà hàng' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.remove(id);
  }
}
