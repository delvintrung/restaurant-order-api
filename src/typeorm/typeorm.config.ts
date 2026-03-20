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
      process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
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
const dbUrl = process.env.DATABASE_URL || '';
const host = process.env.TYPEORM_HOST || '';
const port = parseInt(process.env.TYPEORM_PORT ?? '5432', 10);

// Detect cloud database type from DATABASE_URL
const isNeonOrSupabase =
  dbUrl.includes('neon') ||
  dbUrl.includes('supabase') ||
  host.includes('supabase');
const isRailway = dbUrl.includes('railway') || dbUrl.includes('rlwy');

// Railway proxy doesn't require SSL
const ssl = isNeonOrSupabase ? { rejectUnauthorized: false } : false;

// For Railway: add ?sslmode=disable to URL if not already present
const connectionUrl = isRailway && !dbUrl.includes('sslmode')
  ? `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=disable`
  : dbUrl;

export const dataSource = new DataSource({
  type: 'postgres',
  // Ưu tiên dùng URL (Connection String) cho môi trường Cloud/Vercel/Neon
  url: connectionUrl,

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

  // SSL config: chỉ bắt buộc cho Neon/Supabase, Railway proxy không cần
  ssl,

  // CẤU HÌNH POOL CHO CLOUD DATABASES
  // Railway proxy hỗ trợ connection pooling tốt hơn
  extra:
    isRailway || isNeonOrSupabase
      ? {
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        }
      : {},
});
