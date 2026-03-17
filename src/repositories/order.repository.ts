import { CustomRepository } from 'src/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from 'src/entities/orders.entity';

@CustomRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {}
