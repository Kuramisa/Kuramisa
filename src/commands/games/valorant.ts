import { StringOption } from "Builders";
import {
    AbstractSlashSubcommand,
    SlashSubcommand,
} from "classes/SlashSubcommand";
import type { ChatInputCommandInteraction } from "discord.js";
import {
    ApplicationIntegrationType,
    ComponentType,
    InteractionContextType,
    bold,
} from "discord.js";
import { Pagination } from "utils";

@SlashSubcommand({
    name: "valorant",
    description: "VALORANT Commands",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    subcommands: [
        {
            name: "login",
            description: "Login to your VALORANT account",
            chatInputRun: "slashLogin",
            opts: [
                new StringOption()
                    .setName("valorant_username")
                    .setDescription("Your VALORANT username"),
                new StringOption()
                    .setName("valorant_password")
                    .setDescription("Your VALORANT password"),
            ],
        },
        {
            name: "agents",
            description: "Get information about VALORANT agents",
            chatInputRun: "slashAgents",
            opts: [
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
            chatInputRun: "slashSkins",
            opts: [
                new StringOption()
                    .setName("valorant_weapon")
                    .setDescription("Choose a VALORANT weapon")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "weapons",
            description: "Get information about VALORANT weapons",
            chatInputRun: "slashWeapons",
            opts: [
                new StringOption()
                    .setName("valorant_weapon")
                    .setDescription("Choose a VALORANT Weapon")
                    .setAutocomplete(true),
            ],
        },
    ],
})
export default class ValorantCommand extends AbstractSlashSubcommand {
    async slashLogin(interaction: ChatInputCommandInteraction) {
        const { client, user } = interaction;
        const {
            games: { valorant },
        } = client;

        if (!valorant.accounts.get(user.id))
            await valorant.loadAccounts(user.id);

        return valorant.auth.login(interaction);
    }

    async slashAgents(interaction: ChatInputCommandInteraction) {
        const { client, options } = interaction;
        const {
            games: { valorant },
        } = client;

        const agentName = options.getString("valorant_agent");
        if (!agentName) {
            const embeds = valorant.agents.embeds();
            return Pagination.embeds(interaction, embeds);
        }

        const agent = valorant.agents.get(agentName);
        if (!agent)
            return interaction.reply({
                content: bold("Ermm... Agent not found"),
                flags: "Ephemeral",
            });

        const agentEmbed = valorant.agents.embed(agent);

        await interaction.reply({
            embeds: [agentEmbed],
        });
    }

    async slashSkins(interaction: ChatInputCommandInteraction) {
        const { client, options } = interaction;
        const {
            games: { valorant },
        } = client;

        const weaponName = options.getString("valorant_weapon", true);
        const weapon = valorant.weapons.get(weaponName);

        if (!weapon)
            return interaction.reply({
                content: bold("Ermm... Weapon not found**"),
                flags: "Ephemeral",
            });

        const skins = weapon.skins
            .filter((skin) => skin.contentTierUuid)
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        await interaction.deferReply();

        const infoCollection = valorant.skins.collection(client, skins);

        let page = 0;
        let lvlPage = 0;

        const skin = infoCollection.at(page);
        if (!skin)
            return interaction.reply({
                content: bold("Ermm... Skin not found**"),
                flags: "Ephemeral",
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
                        flags: "Ephemeral",
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
        const { client, options } = interaction;
        const {
            games: { valorant },
        } = client;

        const weaponName = options.getString("valorant_weapon", true);
        const weapon = valorant.weapons.get(weaponName);
        if (!weapon)
            return interaction.reply({
                content: bold("Ermm... Weapon not found"),
                flags: "Ephemeral",
            });
        const weaponEmbed = valorant.weapons.embed(client, weapon);
        const weaponRow = valorant.weapons.row(weapon);
        return interaction.reply({
            embeds: [weaponEmbed],
            components: [weaponRow],
        });
    }
}
