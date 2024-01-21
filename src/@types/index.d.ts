import type { IStaff } from "@schemas/Staff";
import type { Message, User } from "discord.js";

declare module "discord.js" {
    export interface Guild {
        musicMessage: Message | null | undefined;
    }
}

declare interface MongoResult {
    _doc: any;
}

declare type BotStaff = User & IStaff;

declare type CompetitiveTier = {
    tier: number;
    tierName: string;
    division: string;
    divisionName: string;
    color: ColorResolvable;
    backgroundColor: ColorResolvable;
    smallIcon: string;
    largeIcon: string;
    rankTriangleDownIcon: string;
    rankTriangleUpIcon: string;
};

declare type ValorantSkin = {
    level: {
        names: string[];
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<MessageActionRowComponentBuilder>;
        videos: string[];
    };
    chroma: {
        names: string[];
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<MessageActionRowComponentBuilder>;
        videos: string[];
    };
};

declare type ValorantSkinCollection = Collection<string, ValorantSkin>;

declare interface ValorantAccount {
    username: string;
    user: User;
    auth: WebClient;
    player: ValorantPlayerInfo;
    trackerURL?: string;
}

declare type PrivacyTypes = "public" | "friends" | "private";

declare type ValorantBundleItem = {
    Item: {
        ItemTypeID: string;
        ItemID: string;
        Amount: number;
    };
    BasePrice: number;
    CurrencyID: string;
    DiscountPercent: number;
    DiscountedPrice: number;
    IsPromoItem: boolean;
};

declare type ValorantAccessoryItem = {
    Offer: {
        OfferID: string;
        isDirectPurchase: boolean;
        StartDate: string;
        Cost: Record<string, number>;
        Rewards: Array<{
            ItemTypeID: string;
            ItemID: string;
            Quantity: number;
        }>;
    };
    ContractID: string;
};

declare interface ValorantPlayerInfo {
    country: string;
    sub: string;
    email_verified: boolean;
    player_plocale: string;
    country_at: string | null;
    pw: {
        cng_at: number;
        reset: boolean;
        must_reset: boolean;
    };
    phone_number_verified: boolean;
    account_verified: boolean;
    ppid: string | null;
    federated_identity_providers: string[];
    player_locale: "en";
    acct: {
        type: number;
        state: string;
        adm: boolean;
        game_name: string;
        tag_line: string;
        created_at: number;
    };
    age: number;
    jti: string;
    affinity: {
        pp: string;
    };
}

declare interface Metadata {
    interaction:
        | ChatInputCommandInteraction<"cached">
        | ContextMenuCommandInteraction<"cached">;
    guild: Guild;
    channel: TextChannel | VoiceChannel;
}

declare type IWarn = {
    id: string;
    guildId: string;
    by: string;
    reason: string;
    timestamp: number;
};

declare type IReport = {
    id: string;
    guildId: string;
    by: string;
    message?: { id: string; content: string };
    reason: string;
    timestamp: number;
};

declare type IInvite = {
    code: string;
    memberId: string;
    url: string;
    uses: number | null;
    expiresTimestamp: number | null;
    maxAge: number | null;
    maxUses: number | null;
};

declare type StaffType =
    | "lead_developer"
    | "developer"
    | "designer"
    | "bug_tester"
    | "translator";

declare type CardType = "buffer" | "attachment";

// Shinobi Types
declare interface ShinobiClan {
    id: string;
    name: string;
    description: string;
    members: number;
    icon: string;
    stats: ShinobiStats;
}

declare interface ShinobiVillage {
    id: string;
    name: {
        en: string;
        jp: string;
    };
    description: string;
    population: number;
    icon: string;
}

declare interface ShinobiStats {
    hp: number;
    chakra: number;
    ninjutsu: number;
    genjutsu: number;
    taijutsu: number;
    kenjutsu: number;
}

declare interface Currencies {
    ryo: number;
}

declare interface ShinobiWeapon {
    id: string;
    name: string;
    icon: string;
    attack: number;
    cost: number;
}

declare type ShinobiRanks =
    | "genin"
    | "chunin"
    | "jonin"
    | "special_jonin"
    | "hokage"
    | "anbu"
    | "medical"
    | "rogue";
