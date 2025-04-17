import { AbstractEvent, Event } from "classes/Event";
import type { Interaction } from "discord.js";

@Event({
    event: "interactionCreate",
    description: "Manage VALORANT autocomplete for possessions",
})
export default class YourValorantAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "valorant") return;
        if (!interaction.inCachedGuild()) return;

        const {
            client: {
                games: { valorant },
            },
            options,
        } = interaction;

        const { name, value } = options.getFocused(true);

        switch (name) {
            case "valorant_agent": {
                let agents = valorant.agents.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );

                if (value.length > 0)
                    agents = agents.filter((agent) =>
                        agent.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );

                agents = agents.slice(0, 25);

                return interaction.respond(
                    agents.map((agent) => ({
                        name: `${agent.displayName} (${agent.role.displayName})`,
                        value: agent.displayName.toLowerCase(),
                    })),
                );
            }
            case "valorant_buddy": {
                let buddies = valorant.buddies.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );

                if (value.length > 0)
                    buddies = buddies.filter((buddy) =>
                        buddy.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );

                buddies = buddies.slice(0, 25);

                return interaction.respond(
                    buddies.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.displayName.toLowerCase(),
                    })),
                );
            }
            case "valorant_card": {
                let cards = valorant.playerCards.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );

                if (value.length > 0)
                    cards = cards.filter((card) =>
                        card.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );

                cards = cards.slice(0, 25);

                return interaction.respond(
                    cards.map((card) => ({
                        name: card.displayName,
                        value: card.displayName.toLowerCase(),
                    })),
                );
            }
            case "valorant_spray": {
                let sprays = valorant.sprays.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );

                if (value.length > 0)
                    sprays = sprays.filter((spray) =>
                        spray.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );

                sprays = sprays.slice(0, 25);

                return interaction.respond(
                    sprays.map((spray) => ({
                        name: spray.displayName,
                        value: spray.displayName.toLowerCase(),
                    })),
                );
            }
            case "valorant_skin": {
                let skins = valorant.skins.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );
                if (value.length > 0)
                    skins = skins.filter((skin) =>
                        skin.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );
                if (skins.length === 0) return;

                skins = skins.slice(0, 25);

                return interaction.respond(
                    skins.map((skin) => ({
                        name: skin.displayName,
                        value: skin.uuid,
                    })),
                );
            }
            case "valorant_weapon": {
                let weapons = valorant.weapons.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                );

                if (value.length > 0)
                    weapons = weapons.filter((weapon) =>
                        weapon.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                    );

                weapons = weapons.slice(0, 25);

                return interaction.respond(
                    weapons
                        .toSorted(
                            (a, b) =>
                                a.shopData?.category.localeCompare(
                                    b.shopData?.category ?? "",
                                ) ?? 0,
                        )
                        .map((weapon) => ({
                            name: `${weapon.displayName}${weapon.shopData ? ` (${weapon.shopData.category})` : ""}`,
                            value: weapon.displayName.toLowerCase(),
                        })),
                );
            }
        }
    }
}
