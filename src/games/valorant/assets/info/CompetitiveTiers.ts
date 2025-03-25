import { fetch } from "@sapphire/fetch";
import { Embed } from "Builders";
import logger from "Logger";
import type {
    ValorantCompetitiveRank,
    ValorantCompetitiveTier,
} from "typings/Valorant";

import Valorant from "../..";

export default class ValorantCompetitiveTiers {
    private readonly data: ValorantCompetitiveTier[];

    constructor(data: ValorantCompetitiveTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (tier: string) =>
        this.data.find((t) => t.tiers.find((t) => t.tierName === tier)) ??
        this.data.find((t) => t.uuid === tier);

    embed = (tier: ValorantCompetitiveRank) =>
        new Embed()
            .setAuthor({
                name: tier.tierName,
                iconURL: tier.smallIcon,
            })
            .setTitle(`${tier.tierName} (${tier.divisionName})`)
            .setThumbnail(tier.largeIcon)
            .setColor(tier.color);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/competitivetiers`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantCompetitiveTiers(data);
    }
}
