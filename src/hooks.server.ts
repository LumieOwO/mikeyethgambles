import { building } from "$app/environment";
import { creators } from "$lib/server/data/creators";
import { createAllLeaderboards } from "$lib/server/utilities/leaderboard";


if (!building) {
  createAllLeaderboards(creators)
}
