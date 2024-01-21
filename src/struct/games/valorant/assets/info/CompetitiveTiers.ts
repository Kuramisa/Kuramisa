import { CompetitiveTiers } from "@valapi/valorant-api.com";
import { EmbedBuilder } from "discord.js";
import type { CompetitiveTier } from "../../../../../@types";

export default class ValorantCompetitiveTiers {
    private readonly data: CompetitiveTiers.CompetitiveTiers<"en-US">[];

    constructor(data: CompetitiveTiers.CompetitiveTiers<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) => this.data.find(tiers => tiers.tiers.find(tier => tier.tierName === name));

    getByID = (id: string) => this.data.find(tiers => tiers.uuid === id);

    embed = (tier: CompetitiveTier) => new EmbedBuilder()
        .setAuthor({
            name: tier.tierName,
            iconURL: tier.smallIcon
        })
        .setTitle(`${tier.tierName} - ${tier.divisionName}`)
        .setThumbnail(tier.largeIcon)
        .setColor(tier.color);
}
