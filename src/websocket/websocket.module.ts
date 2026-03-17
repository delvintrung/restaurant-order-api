import { Module } from '@nestjs/common';
import { KitchenGateway } from './kitchen.gateway';

@Module({
  providers: [KitchenGateway],
})
export class WebsocketModule {}
