import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AccountRole } from 'src/common/enums/account-role.enum';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
