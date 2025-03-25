import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantContentTier } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantContentTiers {
    private readonly data: ValorantContentTier[];

    constructor(data: ValorantContentTier[]) {
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
            {} as Record<string, ValorantContentTier>,
        );
    }

    get = (tier: string) =>
        this.data.find(
            (t) => t.displayName.toLowerCase() === tier.toLowerCase(),
        ) ?? this.data.find((t) => t.uuid === tier);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/contenttiers`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantContentTiers(data);
    }
}
