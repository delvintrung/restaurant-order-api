import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { OrderEntity } from './orders.entity';
import { decimalTransformer } from '../common/database/decimal.transformer';
import { BaseEntity } from './base.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @Column()
  quantity: number;

  @Column({
    name: 'price_at_order',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  priceAtOrder: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order?: OrderEntity;

  @ManyToOne(() => MenuItemEntity, (menuItem) => menuItem.orderItems)
  @JoinColumn({ name: 'menu_item_id' })
  menuItem?: MenuItemEntity;
}
