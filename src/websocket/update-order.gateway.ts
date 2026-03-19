import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderItemStatus } from 'src/common/enums/order-item.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';

type ClientRole = 'table' | 'kitchen' | 'manager' | 'admin';

interface ClientContext {
  restaurantId: string;
  role?: ClientRole;
  tableId?: string;
}

interface Base {
  tableId: string;
  orderId: string;
}

interface AddItemData extends Base {
  menuItemId: string;
  quantity: number;
  note?: string;
}

interface ChangeOrderStatusData extends Base {
  newStatus: OrderStatus;
}

interface ChangeOrderItemStatusData extends Base {
  newStatus: OrderItemStatus;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UpdateOrderGateway implements OnGatewayConnection {
  handleConnection(client: Socket) {
    const { restaurantId, role, tableId } = client.handshake.auth || {};

    if (!restaurantId) {
      client.disconnect(true);
      return;
    }

    if (role === 'table' && !tableId) {
      client.disconnect(true);
      return;
    }

    const context: ClientContext = {
      restaurantId,
      role,
      tableId,
    };
    client.data.context = context;

    if (tableId) {
      client.join(this.tableRoom(restaurantId, tableId));
    }
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('orders')
  async handleOrderUpdate(
    @MessageBody() data: ChangeOrderStatusData,
    @ConnectedSocket() client: Socket,
  ) {
    const context = this.getContext(client);
    const tableId = context.role === 'table' ? context.tableId : data.tableId;

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    const room = this.tableRoom(context.restaurantId, tableId);
    console.log('Cập nhật trạng thái đơn hàng:', data);

    this.server.to(room).emit('order-updated', {
      restaurantId: context.restaurantId,
      tableId,
      orderId: data.orderId,
      newStatus: data.newStatus,
      time: new Date(),
    });
  }

  @SubscribeMessage('add-item')
  async handleAddItem(
    @MessageBody() data: AddItemData,
    @ConnectedSocket() client: Socket,
  ) {
    const context = this.getContext(client);
    const tableId = context.role === 'table' ? context.tableId : data.tableId;

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    const room = this.tableRoom(context.restaurantId, tableId);

    this.server.to(room).emit('item-added', {
      restaurantId: context.restaurantId,
      tableId,
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      note: data.note,
      time: new Date(),
    });
  }

  @SubscribeMessage('change-order-item-status')
  async handleChangeOrderItemStatus(
    @MessageBody() data: ChangeOrderItemStatusData,
    @ConnectedSocket() client: Socket,
  ): Promise<OrderItemStatus> {
    const context = this.getContext(client);
    const tableId = context.role === 'table' ? context.tableId : data.tableId;

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    const room = this.tableRoom(context.restaurantId, tableId);

    this.server.to(room).emit('order-item-status-changed', {
      restaurantId: context.restaurantId,
      tableId,
      orderId: data.orderId,
      newStatus: data.newStatus,
      time: new Date(),
    });

    console.log('Cập nhật trạng thái món ăn:', data);
    return data.newStatus;
  }

  private getContext(client: Socket): ClientContext {
    const context = client.data.context as ClientContext | undefined;

    if (!context?.restaurantId) {
      throw new WsException('Invalid client context');
    }

    return context;
  }

  private tableRoom(restaurantId: string, tableId: string): string {
    return `restaurant-${restaurantId}-table-${tableId}`;
  }
}
