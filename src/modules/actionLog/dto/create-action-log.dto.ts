import { ApiProperty } from '@nestjs/swagger';

export class CreateActionLogDto {
  @ApiProperty({ description: 'Tên hành động' })
  action: string;

  @ApiProperty({ description: 'ID người thực hiện hành động' })
  userId: string;

  @ApiProperty({ description: 'ID nhà hàng' })
  restaurantId: string;

  @ApiProperty({ description: 'Mô tả chi tiết về hành động', required: false })
  description?: string;
}
