import { IsUUID } from 'class-validator';
import { CreateTableDto } from './create-table.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @IsUUID()
  id: string;
}
