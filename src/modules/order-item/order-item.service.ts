import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { OrderService } from '../order/order.service';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';
import { InsertOrderItemDto } from './dto/insert-order-item.dto';
import { UpdateOrderGateway } from 'src/websocket/update-order.gateway';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
    private readonly orderService: OrderService,
    private readonly actionLogService: ActionLogService,
    private readonly updateOrderGateway: UpdateOrderGateway,
  ) {}

  async create(
    createOrderItemDto: CreateOrderItemDto,
    currentUser: CurrentUserDto,
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
      createdBy: currentUser.userId,
    });

    const savedItem = await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      createOrderItemDto.orderId,
      currentUser.userId,
    );

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'CREATE_ORDER_ITEM',
      description: `Thêm món vào đơn ${savedItem.orderId}: ${savedItem.menuItemId}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      role: currentUser.role,
    });

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
    currentUser: CurrentUserDto,
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

    orderItem.updatedBy = currentUser.userId;

    await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      orderItem.orderId,
      currentUser.userId,
    );

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'UPDATE_ORDER_ITEM',
      description: `Cập nhật món trong đơn ${orderItem.orderId}: ${orderItem.id}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      role: currentUser.role,
    });

    return this.findOne(id);
  }

  async remove(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<{ message: string }> {
    const orderItem = await this.findOne(id);
    const orderId = orderItem.orderId;

    await this.orderItemRepository.remove(orderItem);
    await this.orderService.recalculateOrderTotal(orderId, currentUser.userId);

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'DELETE_ORDER_ITEM',
      description: `Xóa món khỏi đơn ${orderId}: ${id}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      role: currentUser.role,
    });

    return { message: `Order item ${id} deleted successfully` };
  }

  async insertItemToOrder(
    insertOrderItemDto: InsertOrderItemDto,
    currentUser: CurrentUserDto,
  ): Promise<OrderItemEntity> {
    const order = await this.orderService.findOne(insertOrderItemDto.orderId);

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${insertOrderItemDto.orderId} not found`,
      );
    }

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: insertOrderItemDto.menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${insertOrderItemDto.menuItemId} not found`,
      );
    }

    const createOrderItemDto: CreateOrderItemDto = {
      orderId: insertOrderItemDto.orderId,
      menuItemId: insertOrderItemDto.menuItemId,
      quantity: insertOrderItemDto.quantity,
      note: insertOrderItemDto.note,
    };

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'INSERT_ORDER_ITEM',
      description: `Thêm món vào đơn ${insertOrderItemDto.orderId}: ${insertOrderItemDto.menuItemId}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      role: currentUser.role,
    });

    const newOrderItem = await this.create(createOrderItemDto, currentUser);

    this.updateOrderGateway.EmitAddItem({
      restaurantId: currentUser.restaurantId,
      tableId: order.tableId,
      orderId: order.id,
      item: {
        id: newOrderItem.id,
        menuItemId: newOrderItem.menuItemId,
      },
    });

    return newOrderItem;
  }
}
