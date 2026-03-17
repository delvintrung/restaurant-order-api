import {
  Controller,
  Injectable,
  Patch,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantTableService } from './table.service';
import { AccountEntity } from 'src/entities/account.entity';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CreateTableDto } from './dto/create-table.dto';
import { Roles } from '../account/decorators/role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateTableDto } from './dto/update-table.dto';

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
    createTableDto: CreateTableDto,
    @CurrentUser() user: AccountEntity,
  ) {
    return this.restaurantTableService.create(createTableDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật thông tin bàn' })
  async update(
    id: string,
    updateTableDto: UpdateTableDto,
    @CurrentUser() user: AccountEntity,
  ) {
    return this.restaurantTableService.update(id, updateTableDto, user);
  }
  @ApiOperation({ summary: 'Lấy danh sách bàn theo nhà hàng' })
  @Get('restaurant/:restaurantId')
  async findAllTableByRestaurant(restaurantId: string) {
    return this.restaurantTableService.findAllTableByRestaurant(restaurantId);
  }
}
