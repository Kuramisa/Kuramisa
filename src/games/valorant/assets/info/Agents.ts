import { Embed } from "@builders";
import crypto from "crypto";
import Valorant from "games/valorant";

export default class ValorantAgents {
    private readonly data: IValorantAgent[];

    constructor(data: IValorantAgent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (agent: string) =>
        this.data.find(
            (a) => a.displayName.toLowerCase() === agent.toLowerCase()
        ) ?? this.data.find((a) => a.uuid === agent);

    embeds = () =>
        Array.from(
            this.data.toSorted((a, b) =>
                a.displayName.localeCompare(b.displayName)
            ),
            (agent) => this.embed(agent)
        );

    embed = (agent: IValorantAgent) =>
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
                }))
            )
            .setImage(agent.fullPortraitV2)
            .setColor(
                `#${agent.backgroundGradientColors[
                    crypto.randomInt(0, agent.backgroundGradientColors.length)
                ].slice(0, 6)}`
            );

    static async init() {
        const data = await fetch(
            `${Valorant.assetsURL}/agents?isPlayableCharacter=true`
        )
            .then((res) => res.json())
            .then((res) => res.data);

        return new ValorantAgents(data);
    }
}
