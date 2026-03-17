import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { OrderRepository } from 'src/repositories/order.repository';

@ApiTags('orders')
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
  ) {}
}
