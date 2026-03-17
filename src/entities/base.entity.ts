import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity as Base,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends Base {
  @ApiProperty({ description: 'Id khóa chính' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Ngày tạo' })
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Người tạo, lưu user.id' })
  @Column({ type: 'varchar', length: 36, nullable: false })
  createdBy: string;

  @ApiProperty({ description: 'Ngày sửa cuối' })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({ description: 'Người sửa cuối, lưu user.id' })
  @Column({ type: 'varchar', length: 36, nullable: true })
  updatedBy: string;

  @ApiProperty({ description: 'Xóa mềm?' })
  @Column({ name: 'isDeleted', default: false })
  isDeleted: boolean;
}
