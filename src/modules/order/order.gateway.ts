import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'orders', cors: { origin: '*' } })
export class OrderGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-restaurant')
  handleJoinRestaurant(
    @MessageBody() payload: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.getRestaurantRoom(payload.restaurantId));
    return { event: 'joined-restaurant', data: payload };
  }

  @SubscribeMessage('join-table')
  handleJoinTable(
    @MessageBody() payload: { tableId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.getTableRoom(payload.tableId));
    return { event: 'joined-table', data: payload };
  }

  emitOrderCreated(order: { restaurantId: string; tableId: string }) {
    this.server
      ?.to(this.getRestaurantRoom(order.restaurantId))
      .emit('order.created', order);
    this.server
      ?.to(this.getTableRoom(order.tableId))
      .emit('order.created', order);
  }

  emitOrderStatusUpdated(order: { restaurantId: string; tableId: string }) {
    this.server
      ?.to(this.getRestaurantRoom(order.restaurantId))
      .emit('order.status-updated', order);
    this.server
      ?.to(this.getTableRoom(order.tableId))
      .emit('order.status-updated', order);
  }

  private getRestaurantRoom(restaurantId: string) {
    return `restaurant:${restaurantId}`;
  }

  private getTableRoom(tableId: string) {
    return `table:${tableId}`;
  }
}
