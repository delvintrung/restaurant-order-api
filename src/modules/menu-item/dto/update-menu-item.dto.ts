import { PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateMenuItemDto } from './create-menu-item.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @IsUUID()
  id: string;
}
