import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../account/decorators/role.decorator';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { InsertOrderItemDto } from './dto/insert-order-item.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Controller('order-items')
@ApiTags('order-items')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Create a new order item' })
  @Post()
  create(
    @Body() createOrderItemDto: CreateOrderItemDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.orderItemService.create(createOrderItemDto, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Update an order item' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.orderItemService.update(id, updateOrderItemDto, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Delete an order item' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDto) {
    return this.orderItemService.remove(id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get all order items' })
  @Get()
  findAll() {
    return this.orderItemService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get an order item by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Add an item to an order' })
  @Post('add-item')
  insertItemToOrder(
    @Body() insertOrderItemPayload: InsertOrderItemDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.orderItemService.insertItemToOrder(
      insertOrderItemPayload,
      currentUser,
    );
  }
}
