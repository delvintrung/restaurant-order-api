import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  restaurantId: string;

  @IsNumber()
  @IsNotEmpty()
  priority: number;
}
