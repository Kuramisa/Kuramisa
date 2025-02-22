import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";

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
            description: "Get Information about VALORANT agents",
            options: [
                new StringOption()
                    .setName("valorant_agent")
                    .setDescription("Choose a VALORANT Agent")
                    .setAutocomplete(true),
            ],
        },
    ],
})
export default class ValorantCommand extends AbstractSlashCommand {
    slashSkins(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const {
            games: { valorant },
        } = this.client;

        const agentId = options.getString("valorant_agent", true);
        const agent = valorant.agents.get(agentId);
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
}
