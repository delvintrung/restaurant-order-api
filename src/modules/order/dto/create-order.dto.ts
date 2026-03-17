import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: '6a460dac-3768-42ef-a2d8-6051fd5a6f4a' })
  menuItemId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiPropertyOptional({ example: 'Khong hanh' })
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  items: CreateOrderItemDto[];
}
