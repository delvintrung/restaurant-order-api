import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from '../../entities/orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEntity } from 'src/entities/orders.entity';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    currentUser: CurrentUserDto,
  ): Promise<OrderEntity> {
    const order = this.orderRepository.create({
      tableId: createOrderDto.tableId,
      totalPrice: 0,
      status: OrderStatus.PENDING,
      createdBy: currentUser.role,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (createOrderDto.items?.length) {
      const orderItems: OrderItemEntity[] = [];

      for (const itemDto of createOrderDto.items) {
        const menuItem = await this.menuItemRepository.findOne({
          where: { id: itemDto.menuItemId },
        });

        if (!menuItem) {
          throw new NotFoundException(
            `Menu item with ID ${itemDto.menuItemId} not found`,
          );
        }

        orderItems.push(
          this.orderItemRepository.create({
            orderId: savedOrder.id,
            menuItemId: itemDto.menuItemId,
            quantity: itemDto.quantity,
            priceAtOrder: menuItem.price,
            note: itemDto.note,
            createdBy: currentUser.role,
          }),
        );
      }

      await this.orderItemRepository.save(orderItems);
    }

    await this.recalculateOrderTotal(savedOrder.id, currentUser.userId);
    return this.findOne(savedOrder.id);
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      relations: {
        items: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: AccountEntity,
  ): Promise<OrderEntity> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    order.updatedBy = currentUser.id;

    await this.orderRepository.save(order);
    return this.findOne(order.id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: `Order ${id} deleted successfully` };
  }

  async recalculateOrderTotal(
    orderId: string,
    updatedBy?: string,
  ): Promise<OrderEntity> {
    const order = await this.findOne(orderId);

    const items = await this.orderItemRepository.find({
      where: { orderId },
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.priceAtOrder) * Number(item.quantity),
      0,
    );

    order.totalPrice = Number(total.toFixed(2));
    if (updatedBy) {
      order.updatedBy = updatedBy;
    }

    return this.orderRepository.save(order);
  }
}
