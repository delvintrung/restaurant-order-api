import {
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './order_item.entity';
import { RestaurantTableEntity } from './table.entity';
import { decimalTransformer } from '../common/database/decimal.transformer';
import { BaseEntity } from './base.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ name: 'table_id', type: 'uuid' })
  tableId: string;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalPrice: number;

  @Column({
    type: 'simple-enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => RestaurantTableEntity, (table) => table.orders)
  @JoinColumn({ name: 'table_id' })
  table?: RestaurantTableEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items?: OrderItemEntity[];
}
