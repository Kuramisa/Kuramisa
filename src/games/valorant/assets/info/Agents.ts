import crypto from "crypto";

import { Embed } from "Builders";
import { fetch } from "games/valorant/API";
import type { APIValorantAgent } from "typings/APIValorant";

export default class ValorantAgents {
    private readonly data: APIValorantAgent[];

    constructor(data: APIValorantAgent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (agent: string) =>
        this.data.find(
            (a) => a.displayName.toLowerCase() === agent.toLowerCase(),
        ) ?? this.data.find((a) => a.uuid === agent);

    embeds = () =>
        Array.from(
            this.data.toSorted((a, b) =>
                a.displayName.localeCompare(b.displayName),
            ),
            (agent) => this.embed(agent),
        );

    embed = (agent: APIValorantAgent) =>
        new Embed()
            .setAuthor({
                name: agent.displayName,
                iconURL: agent.displayIcon,
            })
            .setTitle(`${agent.displayName} (${agent.role.displayName})`)
            .setDescription(`${agent.description}`)
            .addFields(
                agent.abilities.map((ability) => ({
                    name:
                        ability.slot === "Ultimate"
                            ? `${ability.displayName} (Ultimate)`
                            : ability.displayName,
                    value: ability.description,
                })),
            )
            .setImage(agent.fullPortraitV2)
            .setColor(
                `#${agent.backgroundGradientColors[
                    crypto.randomInt(0, agent.backgroundGradientColors.length)
                ].slice(0, 6)}`,
            );

    static async init() {
        return new ValorantAgents(await fetch("agents"));
    }
}
