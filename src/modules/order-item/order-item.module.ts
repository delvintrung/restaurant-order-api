import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { OrderModule } from '../order/order.module';
import { ActionLogModule } from '../actionLog/action-log.module';
import { OrderEntity } from 'src/entities/orders.entity';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItemEntity, MenuItemEntity, OrderEntity]),
    OrderModule,
    ActionLogModule,
    WebsocketModule,
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
