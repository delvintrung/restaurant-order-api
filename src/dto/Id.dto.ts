import { IsNotEmpty, IsUUID } from 'class-validator';

export class IdDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
