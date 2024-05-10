import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ChatInputCommandInteraction,
    SlashCommandStringOption
} from "discord.js";

@SlashCommand({
    name: "ping",
    description: "P1ing pong!",
    groups: [
        {
            name: "ping",
            description: "Ping pong!",
            subcommands: [
                {
                    name: "pong",
                    description: "Pong!",
                    options: [
                        new SlashCommandStringOption()
                            .setName("text")
                            .setDescription("Text to say")
                    ]
                },
                {
                    name: "peng",
                    description: "Peng!"
                }
            ]
        }
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Pong! in run");
    }

    async slashPingPong(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Pong! :3");
    }

    async slashPingPeng(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Peng! :3");
    }
}
