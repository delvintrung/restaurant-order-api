import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Phở Lý Quốc Sư', description: 'Tên của nhà hàng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '10 Ly Quoc Su, Hoan Kiem, Hanoi',
    description: 'Địa chỉ của nhà hàng',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại của nhà hàng',
  })
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL của logo nhà hàng',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo_url?: string;
}
