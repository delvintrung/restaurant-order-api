import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

type ClientRole = 'table' | 'kitchen';

interface ClientContext {
  restaurantId: string;
  role: ClientRole;
  tableId?: string;
}

interface CallWaiterPayload {
  tableId?: string;
  message: string;
}

interface KitchenResponsePayload {
  tableId: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KitchenGateway implements OnGatewayConnection {
  handleConnection(client: Socket) {
    const { restaurantId, role, tableId } = client.handshake.auth || {};

    if (!restaurantId || (role !== 'table' && role !== 'kitchen')) {
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

    if (role === 'table') {
      client.join(this.tableRoom(restaurantId, tableId));
    }

    if (role === 'kitchen') {
      client.join(this.kitchenRoom(restaurantId));
    }
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-table')
  joinTable(@MessageBody() tableId: string, @ConnectedSocket() client: Socket) {
    const context = this.getContext(client);
    const targetTableId = context.role === 'table' ? context.tableId : tableId;

    if (!targetTableId) {
      throw new WsException('tableId is required');
    }

    const room = this.tableRoom(context.restaurantId, targetTableId);

    client.join(room);

    return {
      event: 'joined-table',
      room,
    };
  }

  @SubscribeMessage('join-kitchen')
  joinKitchen(@ConnectedSocket() client: Socket) {
    const context = this.getContext(client);

    if (context.role !== 'kitchen') {
      throw new WsException('Only kitchen clients can join kitchen room');
    }

    const room = this.kitchenRoom(context.restaurantId);
    client.join(room);

    return {
      event: 'joined-kitchen',
      room,
    };
  }

  @SubscribeMessage('call-waiter')
  handleCallWaiter(
    @MessageBody() data: CallWaiterPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const context = this.getContext(client);
    const tableId = context.role === 'table' ? context.tableId : data.tableId;

    if (!tableId) {
      throw new WsException('tableId is required');
    }

    this.server.to(this.kitchenRoom(context.restaurantId)).emit('new-request', {
      restaurantId: context.restaurantId,
      tableId,
      message: data.message,
      time: new Date(),
    });

    return {
      status: 'sent',
    };
  }

  @SubscribeMessage('kitchen-response')
  kitchenResponse(
    @MessageBody() data: KitchenResponsePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const context = this.getContext(client);

    if (context.role !== 'kitchen') {
      throw new WsException('Only kitchen clients can send kitchen-response');
    }
    const room = this.tableRoom(context.restaurantId, data.tableId);

    this.server.to(room).emit('waiter-response', {
      restaurantId: context.restaurantId,
      tableId: data.tableId,
      message: data.message,
      sender: 'kitchen',
      time: new Date(),
    });

    return {
      status: 'sent-to-table',
    };
  }

  private getContext(client: Socket): ClientContext {
    const context = client.data.context as ClientContext | undefined;

    if (!context?.restaurantId || !context.role) {
      throw new WsException('Invalid client context');
    }

    return context;
  }

  private kitchenRoom(restaurantId: string): string {
    return `restaurant-${restaurantId}-kitchen`;
  }

  private tableRoom(restaurantId: string, tableId: string): string {
    return `restaurant-${restaurantId}-table-${tableId}`;
  }
}
