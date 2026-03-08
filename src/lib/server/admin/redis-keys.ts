const TENANT = "clyde";

export const adminKeys = {
    socials: `tenant:${TENANT}:admin:socials`,
    appearance: `tenant:${TENANT}:admin:appearance`,
    leaderboardsSet: `tenant:${TENANT}:admin:leaderboards`,
    leaderboard: (id: string) => `tenant:${TENANT}:admin:leaderboard:${id}`,
    winners: (id: string) => `tenant:${TENANT}:admin:leaderboard:${id}:winners`,
    runtimeLeaderboard: (id: string) => `tenant:${TENANT}:leaderboard:${id}`,
    runtimeLeaderboardEntries: (id: string) => `tenant:${TENANT}:leaderboard:${id}:entries`,
    runtimeLeaderboardsSet: `tenant:${TENANT}:leaderboards`,
    bonusesSet: `tenant:${TENANT}:admin:bonuses`,
    bonus: (id: string) => `tenant:${TENANT}:admin:bonus:${id}`,
};
