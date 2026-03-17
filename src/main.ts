import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';

  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('Restaurant QR Ordering API')
    .setDescription(
      'Backend demo cho ứng dụng gọi món qua quét QR tại nhà hàng/quán ăn.',
    )
    .setVersion('1.0.0')
    .addTag('app')
    .addTag('restaurants')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field không khai báo trong DTO
      transform: true, // Tự động convert kiểu dữ liệu (vd: string sang number)
    }),
  );

  console.log(
    `API documentation available at http://localhost:${process.env.PORT ?? 3000}/${globalPrefix}/docs`,
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
