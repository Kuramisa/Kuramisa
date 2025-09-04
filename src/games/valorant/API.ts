import { fetch as sapphireFetch } from "@sapphire/fetch";
import { container } from "@sapphire/framework";
import type { Response } from "@typings";
import type {
    APIValorant,
    APIValorantAgent,
    APIValorantBuddy,
    APIValorantBundle,
    APIValorantCeremony,
    APIValorantCompetitiveSeason,
    APIValorantCompetitiveTier,
    APIValorantContentTier,
    APIValorantContract,
    APIValorantCurrency,
    APIValorantEndpoints,
    APIValorantEvent,
    APIValorantGamemode,
    APIValorantLevelBorder,
    APIValorantMap,
    APIValorantMission,
    APIValorantObjective,
    APIValorantPlayerCard,
    APIValorantPlayerTitle,
    APIValorantSeason,
    APIValorantSkin,
    APIValorantSpray,
    APIValorantTheme,
    APIValorantVersion,
    APIValorantWeapon,
} from "@typings/APIValorant";

// Fetch Cosmetics
export async function fetch(endpoint: "buddies"): Promise<APIValorantBuddy[]>;
export async function fetch(endpoint: "bundles"): Promise<APIValorantBundle[]>;
export async function fetch(
    endpoint: "contenttiers",
): Promise<APIValorantContentTier[]>;
export async function fetch(
    endpoint: "levelborders",
): Promise<APIValorantLevelBorder[]>;
export async function fetch(
    endpoint: "playercards",
): Promise<APIValorantPlayerCard[]>;
export async function fetch(
    endpoint: "playertitles",
): Promise<APIValorantPlayerTitle[]>;
export async function fetch(endpoint: "sprays"): Promise<APIValorantSpray[]>;
export async function fetch(
    endpoint: "weapons/skins",
): Promise<APIValorantSkin[]>;

// Fetch Info
export async function fetch(endpoint: "agents"): Promise<APIValorantAgent[]>;
export async function fetch(
    endpoint: "seasons/competitive",
): Promise<APIValorantCompetitiveSeason[]>;
export async function fetch(
    endpoint: "competitivetiers",
): Promise<APIValorantCompetitiveTier[]>;
export async function fetch(
    endpoint: "contracts",
): Promise<APIValorantContract[]>;
export async function fetch(
    endpoint: "currencies",
): Promise<APIValorantCurrency[]>;
export async function fetch(
    endpoint: "ceremonies",
): Promise<APIValorantCeremony[]>;
export async function fetch(endpoint: "events"): Promise<APIValorantEvent[]>;
export async function fetch(
    endpoint: "gamemodes",
): Promise<APIValorantGamemode[]>;
export async function fetch(endpoint: "maps"): Promise<APIValorantMap[]>;
export async function fetch(
    endpoint: "missions",
): Promise<APIValorantMission[]>;
export async function fetch(
    endpoint: "objectives",
): Promise<APIValorantObjective[]>;
export async function fetch(endpoint: "seasons"): Promise<APIValorantSeason[]>;
export async function fetch(endpoint: "themes"): Promise<APIValorantTheme[]>;
export async function fetch(endpoint: "version"): Promise<APIValorantVersion>;
export async function fetch(endpoint: "weapons"): Promise<APIValorantWeapon[]>;

export async function fetch(
    endpoint: APIValorantEndpoints,
): Promise<APIValorant> {
    try {
        const res = await sapphireFetch<Response<APIValorant>>(
            `https://valorant-api.com/v1/${endpoint}`,
        );
        if (res.error) throw new Error(res.error);
        return res.data ?? [];
    } catch (err) {
        container.logger.error(err);
        return [];
    }
}
