import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { RestaurantTableEntity } from './table.entity';
import { MenuItemEntity } from './menu-item.entity';
import { BaseEntity } from './base.entity';

@Entity('restaurants')
export class RestaurantEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @OneToMany(() => RestaurantTableEntity, (table) => table.restaurant)
  tables?: RestaurantTableEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.restaurant)
  categories?: CategoryEntity[];

  @OneToMany(() => MenuItemEntity, (menuItem) => menuItem.restaurant)
  menuItems?: MenuItemEntity[];
}
