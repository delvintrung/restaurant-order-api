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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('DATABASE_URL') || undefined,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'restaurant_order'),
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
        ],
      }),
    }),
    DataStoreModule,
    OrderModule,
    AccountModule,
    AuthModule,
    RestaurantTableModule,
    RestaurantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
