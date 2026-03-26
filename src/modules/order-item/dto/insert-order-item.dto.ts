import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class InsertOrderItemDto {
  @ApiProperty({ example: '6a460dac-3768-42ef-a2d8-6051fd5a6f4a' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: '6a460dac-3768-42ef-a2d8-6051fd5a6f4a' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'Khong ot' })
  @IsOptional()
  note?: string;
}
