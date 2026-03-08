export type Icreator = {
    name: string;
    code: string;
    primaryColor: string;
    description: string;
    logoUrl?: string;
    socials: {
        cardBackground: string;
        icon: string;
        title: string;
        href: string;
    }[];
    cid?: string;
    bonuses?: {
        id: string;
        casino: string;
        code: string;
        href: string;
        mainBonus?: string;
        extraBonus?: string;
        logoUrl?: string;
        color?: string;
    }[];
    websiteLeaderboards: {
        primaryColor: string,
        href: string,
        siteName: string,
        prizes?: { [place: number]: number, } | null,
        highlightedWord: string
        duration: {
            startingDate: Date,
            endingDate: Date
        }
        apiKey?: string
        wageredDetails?: {
            wagerName?: string;
            shouldShowIcon?: boolean;
        }
        rewardLines?: string[];
    }[]
};
export type IYoutubeFeed = {
    status: string;
    feed: {
        url: string;
        title: string;
        link: string;
        author: string;
        description: string;
        image: string;
    };
    items?: {
        title: string;
        pubDate: string;
        link: string;
        guid: string;
        author: string;
        thumbnail: string;
        description: string;
        content: string;
        enclosure: {
            link: string;
            type: string;
            thumbnail: string;
        };
        categories: string[];
    }[];
};
export interface ILeaderboardEntry {
    id: string;              // unique user ID (uuid or site-specific ID)
    username: string;        // player’s username
    avatar: string;          // profile picture / fallback avatar
    totalWagered: number;    // total wagered amount
}
export interface Integration {
    getWagers: (apiKey: string) => Promise<unknown>;
    normalize: (data: unknown) => ILeaderboardEntry[];
}
