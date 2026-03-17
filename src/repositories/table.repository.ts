import { RestaurantTableEntity } from 'src/entities/table.entity';
import { CustomRepository } from 'src/typeorm';
import { Repository } from 'typeorm';

@CustomRepository(RestaurantTableEntity)
export class RestaurantTableRepository extends Repository<RestaurantTableEntity> {}
