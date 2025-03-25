import { Embed } from "Builders";
import { fetch } from "games/valorant/API";
import type {
    APIValorantCompetitiveRank,
    APIValorantCompetitiveTier,
} from "typings/APIValorant";

export default class ValorantCompetitiveTiers {
    private readonly data: APIValorantCompetitiveTier[];

    constructor(data: APIValorantCompetitiveTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (tier: string) =>
        this.data.find((t) => t.tiers.find((t) => t.tierName === tier)) ??
        this.data.find((t) => t.uuid === tier);

    embed = (tier: APIValorantCompetitiveRank) =>
        new Embed()
            .setAuthor({
                name: tier.tierName,
                iconURL: tier.smallIcon,
            })
            .setTitle(`${tier.tierName} (${tier.divisionName})`)
            .setThumbnail(tier.largeIcon)
            .setColor(`#${tier.color}`);

    static async init() {
        return new ValorantCompetitiveTiers(await fetch("competitivetiers"));
    }
}
