import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order_item.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { OrderService } from '../order/order.service';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
    private readonly orderService: OrderService,
    private readonly actionLogService: ActionLogService,
  ) {}

  private resolveActor(currentUser: CurrentUserDto | AccountEntity) {
    const userId =
      (currentUser as CurrentUserDto).userId ??
      (currentUser as AccountEntity).id;
    const restaurantId =
      (currentUser as CurrentUserDto).restaurantId ??
      (currentUser as AccountEntity).restaurantId;
    const role =
      (currentUser as CurrentUserDto).role ??
      String((currentUser as AccountEntity).role ?? 'system');

    return { userId, restaurantId, role };
  }

  async create(
    createOrderItemDto: CreateOrderItemDto,
    currentUser: AccountEntity,
  ): Promise<OrderItemEntity> {
    const actor = this.resolveActor(currentUser);
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
      createdBy: actor.userId,
    });

    const savedItem = await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      createOrderItemDto.orderId,
      actor.userId,
    );

    const actionLogDto: CreateActionLogDto = {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      action: 'CREATE_ORDER_ITEM',
      description: `Thêm món vào đơn ${savedItem.orderId}: ${savedItem.menuItemId}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      role: actor.role,
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
    currentUser: AccountEntity,
  ): Promise<OrderItemEntity> {
    const actor = this.resolveActor(currentUser);
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

    orderItem.updatedBy = actor.userId;

    await this.orderItemRepository.save(orderItem);
    await this.orderService.recalculateOrderTotal(
      orderItem.orderId,
      actor.userId,
    );

    const actionLogDto: CreateActionLogDto = {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      action: 'UPDATE_ORDER_ITEM',
      description: `Cập nhật món trong đơn ${orderItem.orderId}: ${orderItem.id}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      role: actor.role,
    });

    return this.findOne(id);
  }

  async remove(
    id: string,
    currentUser: AccountEntity,
  ): Promise<{ message: string }> {
    const actor = this.resolveActor(currentUser);
    const orderItem = await this.findOne(id);
    const orderId = orderItem.orderId;

    await this.orderItemRepository.remove(orderItem);
    await this.orderService.recalculateOrderTotal(orderId, actor.userId);

    const actionLogDto: CreateActionLogDto = {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      action: 'DELETE_ORDER_ITEM',
      description: `Xóa món khỏi đơn ${orderId}: ${id}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      role: actor.role,
    });

    return { message: `Order item ${id} deleted successfully` };
  }
}
