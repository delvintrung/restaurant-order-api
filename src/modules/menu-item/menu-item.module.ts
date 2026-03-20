import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { CategoryEntity } from 'src/entities/category.entity';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { ActionLogModule } from '../actionLog/action-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItemEntity,
      CategoryEntity,
      RestaurantEntity,
    ]),
    ActionLogModule,
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
