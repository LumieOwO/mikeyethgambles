import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "$env/static/private";
import Redis from "ioredis";
export const connection = {
  username: "default",
  password: REDIS_PASSWORD,
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
}
export const redis = new Redis(connection);
