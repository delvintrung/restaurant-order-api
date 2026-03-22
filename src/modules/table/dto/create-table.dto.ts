import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateTableDto {
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @IsNotEmpty()
  @IsNumber()
  tableNumber: number;
}
