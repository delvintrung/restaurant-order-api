import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { ActionLogModule } from '../actionLog/action-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity]), ActionLogModule],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
