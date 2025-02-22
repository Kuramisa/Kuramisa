import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ChatInputCommandInteraction,
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
                content: "**Ermm... Agent not found**",
                ephemeral: true,
            });

        const agentEmbed = valorant.agents.embed(agent);

        interaction.reply({
            embeds: [agentEmbed],
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
                content: "**Ermm... Weapon not found**",
                ephemeral: true,
            });
        const weaponEmbed = valorant.weapons.embed(weapon);
        const weaponRow = valorant.weapons.row(weapon);
        return interaction.reply({
            embeds: [weaponEmbed],
            components: [weaponRow],
        });
    }
}
