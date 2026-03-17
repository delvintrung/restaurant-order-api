import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KitchenGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-table')
  joinTable(@MessageBody() tableId: string, @ConnectedSocket() client: Socket) {
    const room = `table-${tableId}`;

    client.join(room);

    console.log(`Client ${client.id} joined ${room}`);

    return {
      event: 'joined-table',
      room,
    };
  }

  @SubscribeMessage('join-kitchen')
  joinKitchen(@ConnectedSocket() client: Socket) {
    client.join('kitchen-room');

    console.log(`Kitchen joined kitchen-room`);

    return {
      event: 'joined-kitchen',
    };
  }

  @SubscribeMessage('call-waiter')
  handleCallWaiter(
    @MessageBody()
    data: {
      tableId: string;
      message: string;
    },
  ) {
    console.log('Call waiter:', data);

    this.server.to('kitchen-room').emit('new-request', {
      tableId: data.tableId,
      message: data.message,
      time: new Date(),
    });

    return {
      status: 'sent',
    };
  }

  @SubscribeMessage('kitchen-response')
  kitchenResponse(
    @MessageBody()
    data: {
      tableId: string;
      message: string;
    },
  ) {
    const room = `table-${data.tableId}`;

    this.server.to(room).emit('waiter-response', {
      message: data.message,
    });

    return {
      status: 'sent-to-table',
    };
  }
}
