import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: '6a460dac-3768-42ef-a2d8-6051fd5a6f4a' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: '9d6fc0b5-77e0-4129-9ad2-dfe3eaadf95e' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty({ example: 'Pho bo tai' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Nuoc dung ham xuong 12 tieng' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 55000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/images/pho.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;
}
