import { EmbedBuilder } from "discord.js";
import Valorant from "../..";

export default class ValorantCompetitiveTiers {
    private readonly data: IValorantCompetitiveTier[];

    constructor(data: IValorantCompetitiveTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) =>
        this.data.find((tiers) =>
            tiers.tiers.find((tier) => tier.tierName === name)
        );

    getByID = (id: string) => this.data.find((tiers) => tiers.uuid === id);

    embed = (tier: CompetitiveTierSingleton) =>
        new EmbedBuilder()
            .setAuthor({
                name: tier.tierName,
                iconURL: tier.smallIcon
            })
            .setTitle(`${tier.tierName} - ${tier.divisionName}`)
            .setThumbnail(tier.largeIcon)
            .setColor(tier.color);

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/competitivetiers`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCompetitiveTiers(data);
    }
}
