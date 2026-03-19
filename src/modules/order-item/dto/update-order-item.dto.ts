import { PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {
  @IsUUID()
  id: string;
}
