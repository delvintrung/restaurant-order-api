import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryEntity } from './entities/category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { OrderItemEntity } from './entities/order_item.entity';
import { OrderEntity } from './entities/orders.entity';
import { RestaurantEntity } from './entities/restaurant.entity';
import { RestaurantTableEntity } from './entities/table.entity';
import { DataStoreModule } from './modules/data-store/data-store.module';
import { OrderModule } from './modules/order/order.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { AccountEntity } from './entities/account.entity';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { RestaurantTableModule } from './modules/table/table.module';
import { WebsocketModule } from './websocket/websocket.module';
import { CategoryModule } from './modules/category/category.module';
import { OrderItemModule } from './modules/order-item/order-item.module';
import { MenuItemModule } from './modules/menu-item/menu-item.module';
import { ActionLogEntity } from './entities/action-log.entity';
import { ActionLogModule } from './modules/actionLog/action-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL') || '';

        // Detect cloud database type
        const isNeonOrSupabase =
          dbUrl.includes('neon') || dbUrl.includes('supabase');
        const isRailway = dbUrl.includes('railway') || dbUrl.includes('rlwy');

        // SSL config: only enable for Neon/Supabase
        const ssl = isNeonOrSupabase ? { rejectUnauthorized: false } : false;

        return {
          type: 'postgres' as const,
          url: dbUrl,
          ssl,
          synchronize:
            configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
          autoLoadEntities: true,
          entities: [
            RestaurantEntity,
            RestaurantTableEntity,
            CategoryEntity,
            MenuItemEntity,
            OrderEntity,
            OrderItemEntity,
            AccountEntity,
            ActionLogEntity,
          ],
        };
      },
    }),
    DataStoreModule,
    OrderModule,
    AccountModule,
    AuthModule,
    RestaurantTableModule,
    RestaurantModule,
    WebsocketModule,
    CategoryModule,
    OrderItemModule,
    MenuItemModule,
    ActionLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
