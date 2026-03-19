import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { OrderService } from '../order/order.service';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
    private readonly orderService: OrderService,
  ) {}

  async create(
    createOrderItemDto: CreateOrderItemDto,
    currentUser: AccountEntity,
  ): Promise<OrderItemEntity> {
    await this.orderService.findOne(createOrderItemDto.orderId);

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: createOrderItemDto.menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${createOrderItemDto.menuItemId} not found`,
      );
    }

    const orderItem = this.orderItemRepository.create({
      orderId: createOrderItemDto.orderId,
      menuItemId: createOrderItemDto.menuItemId,
      quantity: createOrderItemDto.quantity,
      priceAtOrder: menuItem.price,
      note: createOrderItemDto.note,
      createdBy: currentUser.id,
    });

    const savedItem = await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      createOrderItemDto.orderId,
      currentUser.id,
    );

    return this.findOne(savedItem.id);
  }

  async findAll(): Promise<OrderItemEntity[]> {
    return this.orderItemRepository.find({
      relations: {
        order: true,
        menuItem: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrderItemEntity> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: {
        order: true,
        menuItem: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    return orderItem;
  }

  async update(
    id: string,
    updateOrderItemDto: UpdateOrderItemDto,
    currentUser: AccountEntity,
  ): Promise<OrderItemEntity> {
    const orderItem = await this.findOne(id);

    if (updateOrderItemDto.menuItemId) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: updateOrderItemDto.menuItemId },
      });

      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID ${updateOrderItemDto.menuItemId} not found`,
        );
      }

      orderItem.menuItemId = updateOrderItemDto.menuItemId;
      orderItem.priceAtOrder = menuItem.price;
    }

    if (updateOrderItemDto.quantity !== undefined) {
      orderItem.quantity = updateOrderItemDto.quantity;
    }

    if (updateOrderItemDto.note !== undefined) {
      orderItem.note = updateOrderItemDto.note;
    }

    orderItem.updatedBy = currentUser.id;

    await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      orderItem.orderId,
      currentUser.id,
    );

    return this.findOne(id);
  }

  async remove(
    id: string,
    currentUser: AccountEntity,
  ): Promise<{ message: string }> {
    const orderItem = await this.findOne(id);
    const orderId = orderItem.orderId;

    await this.orderItemRepository.remove(orderItem);
    await this.orderService.recalculateOrderTotal(orderId, currentUser.id);

    return { message: `Order item ${id} deleted successfully` };
  }
}
