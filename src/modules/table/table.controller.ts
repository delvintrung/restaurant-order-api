import {
  Controller,
  Injectable,
  Body,
  Patch,
  Param,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantTableService } from './table.service';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CreateTableDto } from './dto/create-table.dto';
import { Roles } from '../account/decorators/role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateTableDto } from './dto/update-table.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Injectable()
@Controller('tables')
@ApiTags('Tables')
export class RestaurantTableController {
  constructor(
    private readonly restaurantTableService: RestaurantTableService,
  ) {}

  @ApiOperation({ summary: 'Thêm bàn mới' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async create(
    @Body() createTableDto: CreateTableDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    console.log('Current User:', createTableDto); // Debug log to check the current user information
    return this.restaurantTableService.create(createTableDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật thông tin bàn' })
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.restaurantTableService.update(id, updateTableDto, user);
  }
  @ApiOperation({ summary: 'Lấy danh sách bàn theo nhà hàng' })
  @Get('restaurant/:restaurantId')
  async findAllTableByRestaurant(restaurantId: string) {
    return this.restaurantTableService.findAllTableByRestaurant(restaurantId);
  }
}
