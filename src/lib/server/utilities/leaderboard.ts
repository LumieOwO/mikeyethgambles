import { normalizeSiteName } from "$lib/utils"
import { redis } from "../redis"

export async function createLeaderboard(
  tenantId: string,
  leaderboardId: string,
  duration: { startingDate: Date; endingDate: Date },
) {
  const key = `tenant:${tenantId}:leaderboard:${leaderboardId}`
  if (
    !duration.startingDate ||
    !duration.endingDate ||
    isNaN(duration.startingDate.getTime()) ||
    isNaN(duration.endingDate.getTime())
  ) {
    return { error: "Leadeboard should not exist" };
  }

  const exists = await redis.exists(key)
  if (exists) return { error: 'Leaderboard already exists', tenantId, leaderboardId }
  console.log(duration)
  const data = {
    startingDate: duration.startingDate.toISOString(),
    endTime: duration.endingDate.toISOString(),
    duration: (duration.endingDate.getTime() - duration.startingDate.getTime()).toString(),
  }

  await redis.hset(key, data)
  await redis.sadd(`tenant:${tenantId}:leaderboards`, leaderboardId)

  return { tenantId, leaderboardId, ...data }
}


export async function createAllLeaderboards(creators: Record<string, any>) {
  for (const [tenantId, creator] of Object.entries(creators)) {
    for (const lb of creator.websiteLeaderboards || []) {
      const lbId = normalizeSiteName(lb.siteName)
      const now = new Date()
      const duration = lb.duration?.startingDate && lb.duration?.endingDate
        ? lb.duration
        : { startingDate: now, endingDate: new Date(now.getTime() + 86400000) }

      const created = await createLeaderboard(tenantId, lbId, duration)
      if (created.error) { /* empty */ } else {
        console.log(`Created leaderboard:`, created)
        // scheduleRestart(tenantId, lbId, duration)
      }
    }
  }
}

