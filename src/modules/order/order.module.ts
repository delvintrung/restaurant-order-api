import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderGateway } from './order.gateway';
import { OrderService } from './order.service';
import { OrderRepository } from 'src/repositories/order.repository';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderGateway, OrderRepository],
})
export class OrderModule {}
