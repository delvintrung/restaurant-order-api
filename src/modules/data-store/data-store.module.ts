import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../entities/category.entity';
import { MenuItemEntity } from '../../entities/menu-item.entity';
import { OrderItemEntity } from '../../entities/order_item.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { RestaurantEntity } from '../../entities/restaurant.entity';
import { RestaurantTableEntity } from '../../entities/table.entity';
import { AccountEntity } from 'src/entities/account.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestaurantEntity,
      RestaurantTableEntity,
      CategoryEntity,
      MenuItemEntity,
      OrderEntity,
      OrderItemEntity,
      AccountEntity,
    ]),
  ],
  providers: [],
  exports: [],
})
export class DataStoreModule {}
