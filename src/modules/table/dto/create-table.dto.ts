import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTableDto {
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @IsNotEmpty()
  @IsNumber()
  tableNumber: number;

  @IsString()
  qrCodeToken: string;
}
