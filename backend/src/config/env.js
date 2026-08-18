import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  storagePath: process.env.STORAGE_PATH ?? './uploads',
  heroVideoPath: process.env.HERO_VIDEO_PATH ?? 'assets/video/Hero.mp4',
  heroVideoSecret: process.env.HERO_VIDEO_SECRET,
  waGatewayUrl: process.env.WA_GATEWAY_URL,
  waGatewayToken: process.env.WA_GATEWAY_TOKEN,
  smtp: {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  frontendOrigins: (process.env.FRONTEND_ORIGINS ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  port: Number(process.env.PORT ?? 3000),
};