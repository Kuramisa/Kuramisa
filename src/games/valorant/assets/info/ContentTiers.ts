import { fetch } from "games/valorant/API";
import type { APIValorantContentTier } from "typings/APIValorant";

export default class ValorantContentTiers {
    private readonly data: APIValorantContentTier[];

    constructor(data: APIValorantContentTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get byName() {
        return this.data.reduce(
            (obj, tier) => {
                obj[tier.displayName] = tier;
                return obj;
            },
            {} as Record<string, APIValorantContentTier>,
        );
    }

    get = (tier: string) =>
        this.data.find(
            (t) => t.displayName.toLowerCase() === tier.toLowerCase(),
        ) ?? this.data.find((t) => t.uuid === tier);

    static readonly init = async () =>
        new ValorantContentTiers(await fetch("contenttiers"));
}
