import { KBooleanOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "content-filter",
    description: "Content filter system for the server",
    subcommands: [
        {
            name: "messages",
            description: "Filter messages",
            options: [
                new KBooleanOption()
                    .setName("enabled")
                    .setDescription(
                        "Enable (True) or disable (False) the content filter"
                    )
            ]
        },
        {
            name: "media",
            description: "Filter media",
            options: [
                new KBooleanOption()
                    .setName("enabled")
                    .setDescription(
                        "Enable (True) or disable (False) the content filter"
                    )
            ]
        }
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async slashMessages(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { database } = this.client;
        const { guildId, options } = interaction;

        const db = await database.guilds.fetch(guildId);
        const enabled = options.getBoolean("enabled", true);

        db.filters.message.enabled = enabled;
        await db.save();

        interaction.reply({
            content: `Message filter has been ${
                enabled ? "enabled" : "disabled"
            }`,
            ephemeral: true
        });
    }

    async slashMedia(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { database } = this.client;
        const { guildId, options } = interaction;

        const db = await database.guilds.fetch(guildId);
        const enabled = options.getBoolean("enabled", true);

        db.filters.media.enabled = enabled;
        await db.save();

        interaction.reply({
            content: `Media filter has been ${
                enabled ? "enabled" : "disabled"
            }`,
            ephemeral: true
        });
    }
}
