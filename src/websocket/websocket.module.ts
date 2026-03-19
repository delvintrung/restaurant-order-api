import { Module } from '@nestjs/common';
import { KitchenGateway } from './kitchen.gateway';
import { UpdateOrderGateway } from './update-order.gateway';

@Module({
  providers: [KitchenGateway, UpdateOrderGateway],
})
export class WebsocketModule {}
