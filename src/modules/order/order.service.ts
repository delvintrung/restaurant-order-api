import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../../entities/orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {}
