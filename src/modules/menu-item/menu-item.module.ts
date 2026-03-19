import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { CategoryEntity } from 'src/entities/category.entity';
import { RestaurantEntity } from 'src/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItemEntity,
      CategoryEntity,
      RestaurantEntity,
    ]),
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
