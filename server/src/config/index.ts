import dotenv from "dotenv";

dotenv.config();

interface Config {
  PORT: number;
  DB_USER: string;
  DB_PASS: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  NODE_ENV: string;
}

const getConfig = (): Config => {
  const requiredEnvVars = ['DB_USER', 'DB_PASS', 'ACCESS_TOKEN_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required`);
    }
  }

  return {
    PORT: parseInt(process.env.PORT || '5000', 10),
    DB_USER: process.env.DB_USER!,
    DB_PASS: process.env.DB_PASS!,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '12h',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
};

export const config = getConfig();