import { Embed } from "@builders";
import Valorant from "../..";

export default class ValorantCompetitiveTiers {
    private readonly data: IValorantCompetitiveTier[];

    constructor(data: IValorantCompetitiveTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (tier: string) =>
        this.data.find((t) => t.tiers.find((t) => t.tierName === tier)) ??
        this.data.find((t) => t.uuid === tier);

    embed = (tier: IValorantCompetitiveRank) =>
        new Embed()
            .setAuthor({
                name: tier.tierName,
                iconURL: tier.smallIcon,
            })
            .setTitle(`${tier.tierName} (${tier.divisionName})`)
            .setThumbnail(tier.largeIcon)
            .setColor(tier.color);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/competitivetiers`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCompetitiveTiers(data);
    }
}
