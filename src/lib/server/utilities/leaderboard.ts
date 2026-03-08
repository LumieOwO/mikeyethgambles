import { normalizeSiteName } from "$lib/utils"
import type { Icreator } from "$lib/types"
import { redis } from "../redis"

const TENANT_ID = "clyde";

export async function createLeaderboard(
  leaderboardId: string,
  duration: { startingDate: Date; endingDate: Date },
) {
  const key = `tenant:${TENANT_ID}:leaderboard:${leaderboardId}`
  if (
    !duration.startingDate ||
    !duration.endingDate ||
    isNaN(duration.startingDate.getTime()) ||
    isNaN(duration.endingDate.getTime())
  ) {
    return { error: "Leaderboard should not exist" };
  }

  const exists = await redis.exists(key)
  if (exists) return { error: 'Leaderboard already exists', leaderboardId }
  console.log(duration)
  const data = {
    startingDate: duration.startingDate.toISOString(),
    endTime: duration.endingDate.toISOString(),
    duration: (duration.endingDate.getTime() - duration.startingDate.getTime()).toString(),
  }

  await redis.hset(key, data)
  await redis.sadd(`tenant:${TENANT_ID}:leaderboards`, leaderboardId)

  return { leaderboardId, ...data }
}


export async function initLeaderboards(creator: Icreator) {
  for (const lb of creator.websiteLeaderboards || []) {
    const lbId = normalizeSiteName(lb.siteName)
    const now = new Date()
    const duration = lb.duration?.startingDate && lb.duration?.endingDate
      ? lb.duration
      : { startingDate: now, endingDate: new Date(now.getTime() + 86400000) }

    const created = await createLeaderboard(lbId, duration)
    if (created.error) { /* empty */ } else {
      console.log(`Created leaderboard:`, created)
    }
  }
}
