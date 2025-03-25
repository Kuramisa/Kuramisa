import crypto from "crypto";

import { fetch } from "@sapphire/fetch";
import { Embed } from "Builders";
import Valorant from "games/valorant";
import logger from "Logger";
import type { ValorantAgent } from "typings/Valorant";

export default class ValorantAgents {
    private readonly data: ValorantAgent[];

    constructor(data: ValorantAgent[]) {
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

    embed = (agent: ValorantAgent) =>
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
        const data = await fetch<any>(
            `${Valorant.assetsURL}/agents?isPlayableCharacter=true`,
        )
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantAgents(data);
    }
}
