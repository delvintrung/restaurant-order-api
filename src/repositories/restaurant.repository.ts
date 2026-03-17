import { CustomRepository } from 'src/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../entities/restaurant.entity';

@CustomRepository(RestaurantEntity)
export class RestaurantRepository extends Repository<RestaurantEntity> {}
