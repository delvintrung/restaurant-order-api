import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../entities/orders.entity';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PREPARING })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
