import { BaseEntity } from './base.entity';
import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('action_logs')
export class ActionLogEntity extends BaseEntity {
  @ApiProperty({ description: 'Tên hành động' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  action: string;

  @ApiProperty({ description: 'ID người thực hiện hành động' })
  @Column({ type: 'varchar', length: 36, nullable: false })
  userId: string;

  @ApiProperty({ description: 'ID nhà hàng' })
  @Column({ type: 'varchar', length: 36, nullable: false })
  restaurantId: string;

  @ApiProperty({ description: 'Mô tả chi tiết về hành động' })
  @Column({ type: 'text', nullable: true })
  description?: string;
}
