import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/orders.entity';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { ActionLogModule } from '../actionLog/action-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, MenuItemEntity]),
    ActionLogModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
