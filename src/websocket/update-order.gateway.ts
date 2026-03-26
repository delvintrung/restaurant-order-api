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

type ClientRole = 'table' | 'kitchen';

interface ClientContext {
  restaurantId: string;
  role?: ClientRole;
  tableId?: string;
}

interface Base {
  tableId: string;
  orderId: string;
}

interface AddItemData {
  categoryId: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  note?: string;
}

interface CreateOrderData {
  orderId: string;
  tableId: string;
  restaurantId: string;
}

interface ChangeOrderItemStatusData extends Base {
  newStatus: OrderItemStatus;
}

interface InsertOrderItemData {
  restaurantId: string;
  tableId: string;
  orderId: string;
  item: {
    id: string;
    menuItemId: string;
  };
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

  EmitNewOrder(@MessageBody() data: CreateOrderData) {
    const tableId = data.tableId;

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    const room = this.kitchenRoom(data.restaurantId);

    this.server.to(room).emit('new-order', {
      restaurantId: data.restaurantId,
      tableId: data.tableId,
      orderId: data.orderId,
      time: new Date(),
    });
  }

  EmitAddItem(
    @MessageBody()
    data: InsertOrderItemData,
  ) {
    const tableId = this.tableRoom(data.restaurantId, data.tableId);

    console.log('Emitting item added:', tableId);

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    this.server.to(tableId).emit('item-added', {
      restaurantId: data.restaurantId,
      orderId: data.orderId,
      tableId,
      item: data.item,
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

  private kitchenRoom(restaurantId: string): string {
    return `restaurant-${restaurantId}-kitchen`;
  }
}
