import { Agents } from "@valapi/valorant-api.com";
import { type ColorResolvable, EmbedBuilder } from "discord.js";

export default class ValorantAgents {
    private readonly data: Agents.Agents<"en-US">[];

    constructor(data: Agents.Agents<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) =>
        this.data.find((agent) => agent.displayName === name);

    getByID = (id: string) => this.data.find((agent) => agent.uuid === id);

    // Add voice lines part when available
    embed = (agent: Agents.Agents<"en-US">) =>
        new EmbedBuilder()
            .setAuthor({
                name: agent.displayName,
                iconURL: agent.displayIcon,
            })
            .setTitle(`${agent.displayName} - ${agent.role.displayName}`)
            .setDescription(agent.description)
            .addFields(
                agent.abilities.map((ability) => ({
                    name:
                        ability.slot === "Ultimate"
                            ? `${ability.displayName} (Ultimate)`
                            : ability.displayName,
                    value: ability.description,
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
}
