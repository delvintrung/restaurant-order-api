import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../entities/orders.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PREPARING })
  status: OrderStatus;
}
