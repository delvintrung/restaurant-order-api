import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: '6a460dac-3768-42ef-a2d8-6051fd5a6f4a' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: '20be8f2a-c68f-45db-a51e-27d08222ce9d' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Khong ot' })
  @IsOptional()
  @IsString()
  note?: string;
}
