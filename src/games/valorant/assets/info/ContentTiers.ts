import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantContentTiers {
    private readonly data: IValorantContentTier[];

    constructor(data: IValorantContentTier[]) {
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
            {} as Record<string, IValorantContentTier>
        );
    }

    get = (tier: string) =>
        this.data.find(
            (t) => t.displayName.toLowerCase() === tier.toLowerCase()
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
