import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderEntity } from './orders.entity';
import { RestaurantEntity } from './restaurant.entity';
import { TableStatus } from '../common/enums/table-status.enum';
import { BaseEntity } from './base.entity';

@Entity('tables')
export class RestaurantTableEntity extends BaseEntity {
  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  @Column({ name: 'table_number' })
  tableNumber: number;

  @Column({ name: 'qr_code_token', unique: true })
  qrCodeToken: string;

  @Column({
    type: 'simple-enum',
    enum: TableStatus,
    default: TableStatus.EMPTY,
  })
  status: TableStatus;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.tables)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @OneToMany(() => OrderEntity, (order) => order.table)
  orders?: OrderEntity[];
}
