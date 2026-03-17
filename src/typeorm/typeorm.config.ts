// Only load dotenv in development/local environment
// In production (Railway, K8s, Docker), env vars are already set by the platform

if (process.env.NODE_ENV !== 'production') {
  try {
    // Dynamic require to avoid bundling in production
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    const path = require('path');

    // Tự động load file môi trường dựa vào NODE_ENV
    const envFile =
      process.env.NODE_ENV === 'development' ? '.env.dev' : '.env';
    const envPath = path.resolve(process.cwd(), envFile);

    dotenv.config({ path: envPath });
    console.log(`✅ Loaded environment from: ${envFile}`);
  } catch (error) {
    // dotenv not available in production build, which is fine
    console.log('dotenv not loaded (production environment)');
  }
}

import { DataSource } from 'typeorm';

// Check if SSL is needed (Neon, Supabase or cloud databases)
const host = process.env.TYPEORM_HOST || '';
const port = parseInt(process.env.TYPEORM_PORT ?? '5432', 10);
const isCloud =
  process.env.DATABASE_URL || host.includes('supabase') || port === 6543;

export const dataSource = new DataSource({
  type: 'postgres',
  // Ưu tiên dùng URL (Connection String) cho môi trường Cloud/Vercel/Neon
  url: process.env.DATABASE_URL,

  // Fallback dùng biến rời cho môi trường Local
  host: !process.env.DATABASE_URL ? process.env.TYPEORM_HOST : undefined,
  port: !process.env.DATABASE_URL ? port : undefined,
  username: !process.env.DATABASE_URL
    ? process.env.TYPEORM_USERNAME
    : undefined,
  password: !process.env.DATABASE_URL
    ? process.env.TYPEORM_PASSWORD
    : undefined,
  database: !process.env.DATABASE_URL
    ? process.env.TYPEORM_DATABASE
    : undefined,

  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  // 1. Cấu hình SSL: Bắt buộc cho Neon và Supabase
  ssl: isCloud ? { rejectUnauthorized: false } : false,

  // 2. CẤU HÌNH QUAN TRỌNG ĐỂ CHỐNG TRÀN KẾT NỐI (POOL CONFIG)
  // Neon khuyến nghị sử dụng pooled connection (pooler) và giới hạn connections
  extra: isCloud
    ? {
        max: 10, // Số kết nối tối đa trong pool (Neon free tier hỗ trợ đến 10)
        idleTimeoutMillis: 30000, // Tự động đóng kết nối thừa sau 30s
        connectionTimeoutMillis: 5000, // Timeout nếu không kết nối được sau 5s
      }
    : {},
});
