import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import { InteractionContextType } from "discord.js";

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
export default class ValorantCommand extends AbstractSlashCommand {}
