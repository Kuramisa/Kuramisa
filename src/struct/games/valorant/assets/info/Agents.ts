import { type ColorResolvable } from "discord.js";
import Valorant from "../..";
import { KEmbed } from "@builders";

export default class ValorantAgents {
    private readonly data: IValorantAgent[];

    constructor(data: IValorantAgent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) =>
        this.data.find((agent) => agent.displayName === name);

    getByID = (id: string) => this.data.find((agent) => agent.uuid === id);

    // Add voice lines part when available
    embed = (agent: IValorantAgent) =>
        new KEmbed()
            .setAuthor({
                name: agent.displayName,
                iconURL: agent.displayIcon
            })
            .setTitle(`${agent.displayName} - ${agent.role.displayName}`)
            .setDescription(agent.description)
            .addFields(
                agent.abilities.map((ability) => ({
                    name:
                        ability.slot === "Ultimate"
                            ? `${ability.displayName} (Ultimate)`
                            : ability.displayName,
                    value: ability.description
                }))
            )
            .setImage(agent.fullPortraitV2)
            .setColor(
                `#${
                    agent.backgroundGradientColors[
                        Math.floor(
                            Math.random() *
                                agent.backgroundGradientColors.length
                        )
                    ].slice(0, 6) as ColorResolvable
                }`
            )
            .setThumbnail(agent.displayIcon);

    static async fetch() {
        const data = await fetch(
            `${Valorant.assetsURL}/agents?isPlayableCharacter=true`
        )
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantAgents(data);
    }
}
