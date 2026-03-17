# Restaurant QR Ordering API

Backend NestJS demo cho bài toán gọi món tại quán qua quét mã QR. Ứng dụng bám theo schema bạn đưa ra gồm:

- restaurants
- tables
- categories
- menu_items
- orders
- order_items

Hiện tại project đã kết nối PostgreSQL bằng TypeORM. Khi database còn trống, app sẽ tự seed dữ liệu mẫu để bạn test ngay.

## Tính năng chính

- Khách quét QR để lấy menu theo bàn.
- Tạo order từ QR token của bàn.
- Nhà hàng xem danh sách bàn và order theo cửa hàng.
- Cập nhật trạng thái order theo thời gian thực.
- Swagger docs tại `/docs`.
- WebSocket namespace `/orders` cho event realtime.

## Cài đặt

```bash
npm install
```

## Chạy PostgreSQL cục bộ

Bạn có thể dùng file compose đi kèm:

```bash
docker compose up -d
```

Hoặc tự cấu hình một PostgreSQL khác rồi cập nhật biến môi trường.

## Biến môi trường

Tạo file `.env` từ `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=restaurant_order
DB_SYNCHRONIZE=true
```

Bạn cũng có thể dùng `DATABASE_URL` thay cho nhóm biến trên.

## Chạy project

```bash
npm run start:dev
```

Mặc định server chạy tại `http://localhost:3000`.

Swagger chạy tại `http://localhost:3000/docs`.

## API chính

```text
GET    /                       -> thông tin app + QR token demo
GET    /docs                   -> swagger UI
GET    /qr/:token/menu         -> lấy menu theo bàn vừa quét QR
POST   /qr/:token/orders       -> tạo order mới cho bàn
GET    /restaurants/:id/menu   -> lấy menu theo nhà hàng
GET    /restaurants/:id/tables -> danh sách bàn và trạng thái
GET    /restaurants/:id/orders -> danh sách order của nhà hàng
PATCH  /restaurants/:id/orders/:orderId/status -> đổi trạng thái order
```

## WebSocket realtime

Namespace: `/orders`

Client có thể join room bằng các event:

```text
join-restaurant { restaurantId: number }
join-table      { tableId: number }
```

Server phát các event:

```text
order.created
order.status-updated
```

## Dữ liệu demo

Route `/` trả về sẵn danh sách `demoQrTokens` để test nhanh bằng Postman hoặc frontend. Dữ liệu này được seed vào PostgreSQL ở lần chạy đầu nếu database đang rỗng.

## Kiểm thử

```bash
npm run test
npm run test:e2e
npm run build
```
