import { redis } from "$lib/server/redis";
import type { ILeaderboardEntry } from "$lib/types";

export async function cacheEntries(
  tenantId: string,
  leaderboardId: string,
  entries: ILeaderboardEntry[]
) {
  const key = `tenant:${tenantId}:leaderboard:${leaderboardId}:entries`;
  await redis.set(key, JSON.stringify(entries), "EX", 900);
}

export async function getEntries(
  tenantId: string,
  leaderboardId: string
): Promise<ILeaderboardEntry[] | null> {
  const key = `tenant:${tenantId}:leaderboard:${leaderboardId}:entries`;
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as ILeaderboardEntry[]) : null;
}
