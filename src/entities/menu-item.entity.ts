import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { OrderItemEntity } from './order_item.entity';
import { decimalTransformer } from '../common/database/decimal.transformer';
import { RestaurantEntity } from './restaurant.entity';
import { BaseEntity } from './base.entity';

@Entity('menu_items')
export class MenuItemEntity extends BaseEntity {
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'restaurant_id', type: 'uuid', nullable: true })
  restaurantId: string | null;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @ManyToOne(() => CategoryEntity, (category) => category.menuItems)
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.menuItems)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.menuItem)
  orderItems?: OrderItemEntity[];
}
