import type Auth from "@valapi/auth";
import type WebClient from "@valapi/web-client";
import type { UserInfoResponse } from "@valapi/web-client";
import type { Embed } from "Builders";
import type {
    ActionRowBuilder,
    Collection,
    MessageActionRowComponentBuilder,
    User,
} from "discord.js";
import type {
    APIValorantBuddy,
    APIValorantPlayerCard,
    APIValorantPlayerTitle,
    APIValorantSkin,
    APIValorantSpray,
} from "./APIValorant";

export interface ValorantFeaturedBundle extends ValorantBundle {
    uuid: string;
    price: number;
    wholeSaleOnly: boolean;
    displayName: string;
    items: ValorantBundleItem &
        (
            | (APIValorantSkin & { type: "skin_level" })
            | (APIValorantBuddy & { type: "buddy" })
            | (APIValorantSpray & { type: "spray" })
            | (APIValorantPlayerCard & { type: "player_card" })
            | (APIValorantPlayerTitle & { type: "player_title" })
        )[];
    secondsRemaining: number;
    expiresAt: string | Date;
}

export interface ValorantSkinInfo {
    name: string;
    uuid: string;
    level: {
        names: string[];
        embeds: Embed[];
        components: ActionRowBuilder<MessageActionRowComponentBuilder>;
        videos: string[];
    };
    chroma: {
        names: string[];
        embeds: Embed[];
        components: ActionRowBuilder<MessageActionRowComponentBuilder>;
        videos: string[];
    };
}

export type ValorantSkinCollection = Collection<string, ValorantSkinInfo>;

export type PrivacyTypes = "public" | "friends" | "private";

export interface ValorantBundleItem {
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
}

export interface ValorantAccessoryItem {
    Offer: {
        OfferID: string;
        isDirectPurchase: boolean;
        StartDate: string;
        Cost: Record<string, number>;
        Rewards: {
            ItemTypeID: string;
            ItemID: string;
            Quantity: number;
        }[];
    };
    ContractID: string;
}

export interface ValorantPlayerInfo {
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

export interface ValorantAccount {
    username: string;
    user: User;
    auth: Auth;
    web: WebClient;
    player: UserInfoResponse;
    trackerURL: string;
}
