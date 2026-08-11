import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};

export function requireDatabaseUrl(): string {
  return getEnv("DATABASE_URL");
}

export function getJwtSecret(): string {
  return getEnv("JWT_SECRET");
}

export function getJwtExpiresIn(): string {
  return env.jwtExpiresIn;
}
