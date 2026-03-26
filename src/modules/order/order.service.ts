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
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';
import { UpdateOrderGateway } from 'src/websocket/update-order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
    private readonly actionLogService: ActionLogService,
    private readonly updateOrderGateway: UpdateOrderGateway,
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

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: currentUser.restaurantId,
      action: 'CREATE_ORDER',
      description: `Tạo đơn hàng: ${savedOrder.id}`,
    };

    await this.actionLogService.create(actionLogDto, currentUser);

    this.updateOrderGateway.EmitNewOrder({
      restaurantId: currentUser.restaurantId,
      tableId: savedOrder.tableId,
      orderId: savedOrder.id,
    });

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
    const actor = this.resolveActor(currentUser);
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    order.updatedBy = actor.userId;

    await this.orderRepository.save(order);

    const actionLogDto: CreateActionLogDto = {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      action: 'UPDATE_ORDER_STATUS',
      description: `Cập nhật trạng thái đơn ${order.id} thành ${order.status}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      role: actor.role,
    });

    return this.findOne(order.id);
  }

  async remove(
    id: string,
    currentUser: AccountEntity,
  ): Promise<{ message: string }> {
    const actor = this.resolveActor(currentUser);
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);

    const actionLogDto: CreateActionLogDto = {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      action: 'DELETE_ORDER',
      description: `Xóa đơn hàng: ${order.id}`,
    };

    await this.actionLogService.create(actionLogDto, {
      userId: actor.userId,
      restaurantId: actor.restaurantId,
      role: actor.role,
    });

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
