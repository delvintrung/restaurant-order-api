import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { RestaurantEntity } from './restaurant.entity';
import { BaseEntity } from './base.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  @Column()
  name: string;

  @Column()
  priority: number;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.categories)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @OneToMany(() => MenuItemEntity, (menuItem) => menuItem.category)
  menuItems?: MenuItemEntity[];
}
