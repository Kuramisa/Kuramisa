import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    bold,
    ChatInputCommandInteraction,
    ComponentType,
    InteractionContextType,
} from "discord.js";
import { Pagination } from "utils";

@SlashCommand({
    name: "valorant",
    description: "VALORANT Commands",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    subcommands: [
        {
            name: "agents",
            description: "Get information about VALORANT agents",
            options: [
                new StringOption()
                    .setName("valorant_agent")
                    .setDescription("Choose a VALORANT Agent")
                    .setRequired(false)
                    .setAutocomplete(true),
            ],
        },
        {
            name: "skins",
            description: "Get information about VALORANT skins",
            options: [
                new StringOption()
                    .setName("valorant_weapon")
                    .setDescription("Choose a VALORANT weapon")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "weapons",
            description: "Get information about VALORANT weapons",
            options: [
                new StringOption()
                    .setName("valorant_weapon")
                    .setDescription("Choose a VALORANT Weapon")
                    .setAutocomplete(true),
            ],
        },
    ],
})
export default class ValorantCommand extends AbstractSlashCommand {
    slashAgents(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const {
            games: { valorant },
        } = this.client;

        const agentName = options.getString("valorant_agent");
        if (!agentName) {
            const embeds = valorant.agents.embeds();
            return Pagination.embeds(interaction, embeds);
        }

        const agent = valorant.agents.get(agentName);
        if (!agent)
            return interaction.reply({
                content: bold("Ermm... Agent not found"),
                flags: ["Ephemeral"],
            });

        const agentEmbed = valorant.agents.embed(agent);

        interaction.reply({
            embeds: [agentEmbed],
        });
    }

    async slashSkins(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const {
            games: { valorant },
        } = this.client;

        const weaponName = options.getString("valorant_weapon", true);
        const weapon = valorant.weapons.get(weaponName);

        if (!weapon)
            return interaction.reply({
                content: bold("Ermm... Weapon not found**"),
                flags: ["Ephemeral"],
            });

        const skins = weapon.skins
            .filter((skin) => skin.contentTierUuid)
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        await interaction.deferReply();

        const infoCollection = valorant.skins.collection(skins);

        let page = 0;
        let lvlPage = 0;

        const skin = infoCollection.at(page);
        if (!skin)
            return interaction.reply({
                content: bold("Ermm... Skin not found**"),
                flags: ["Ephemeral"],
            });

        const message = await interaction.editReply({
            embeds: [skin.level.embeds[0]],
            components: valorant.util.determineComponents(skin, true),
        });

        const buttonNames = ["previous_skin", "next_skin", "add_to_wishlist"];

        const buttonCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                (buttonNames.includes(i.customId) ||
                    i.customId.includes("valorant_skin_chroma")),
            componentType: ComponentType.Button,
        });

        const menuCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === "valorant_weapon_skin_level_select",
            componentType: ComponentType.StringSelect,
        });

        buttonCollector.on("collect", async (i) => {
            switch (i.customId) {
                case "previous_skin": {
                    page = page > 0 ? --page : infoCollection.size;
                    lvlPage = 0;
                    break;
                }
                case "next_skin": {
                    page = page + 1 < infoCollection.size ? ++page : 0;
                    lvlPage = 0;
                    break;
                }
                case "add_to_wishlist": {
                    await i.reply({
                        content: bold("😁 Coming Soon™️!"),
                        flags: ["Ephemeral"],
                    });
                    return;
                }
            }

            if (i.customId.includes("valorant_skin_chroma")) {
                const skin = infoCollection.at(page);
                if (!skin) return;
                const chromaPage = parseInt(i.customId.split("_")[3]);
                if (isNaN(chromaPage)) return;

                await valorant.util.updateInfoChroma(i, skin, chromaPage, true);
                return;
            }

            const skin = infoCollection.at(page);
            if (!skin) return;

            await valorant.util.updateInfoLevel(i, skin, lvlPage, true);
        });

        menuCollector.on("collect", async (i) => {
            lvlPage = parseInt(i.values[0]);
            const skin = infoCollection.at(page);
            if (!skin) return;
            await valorant.util.updateInfoLevel(i, skin, lvlPage, true);
        });
    }

    slashWeapons(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const {
            games: { valorant },
        } = this.client;

        const weaponName = options.getString("valorant_weapon", true);
        const weapon = valorant.weapons.get(weaponName);
        if (!weapon)
            return interaction.reply({
                content: bold("Ermm... Weapon not found"),
                flags: ["Ephemeral"],
            });
        const weaponEmbed = valorant.weapons.embed(weapon);
        const weaponRow = valorant.weapons.row(weapon);
        return interaction.reply({
            embeds: [weaponEmbed],
            components: [weaponRow],
        });
    }
}
