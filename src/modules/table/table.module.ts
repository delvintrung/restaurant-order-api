import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { RestaurantTableEntity } from 'src/entities/table.entity';
import { RestaurantTableService } from './table.service';
import { RestaurantTableController } from './table.controller';
import { RestaurantTableRepository } from 'src/repositories/table.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantTableEntity, RestaurantEntity]),
  ],
  controllers: [RestaurantTableController],
  providers: [RestaurantTableService, RestaurantTableRepository],
  exports: [RestaurantTableService, RestaurantTableRepository],
})
export class RestaurantTableModule {}
