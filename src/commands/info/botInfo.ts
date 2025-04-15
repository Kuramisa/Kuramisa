import { Embed } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction } from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    bold,
    time,
} from "discord.js";

@SlashCommand({
    name: "bot-info",
    description: "Get information about the bot",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
})
export default class BotInfoCommand extends AbstractSlashCommand {
    async chatInputRun(interaction: ChatInputCommandInteraction) {
        const { client } = interaction;

        if (!client.isReady())
            return interaction.reply({
                content: bold("Kuramisa is still starting up..."),
                ephemeral: true,
            });

        const { database, stores, user: clientUser } = client;
        const application = await client.application.fetch();

        const databaseStatus = [
            "Disconnected",
            "Connected",
            "Connecting",
            "Disconnecting",
        ][database.connection.connection.readyState];

        const embed = new Embed()
            .setTitle(`${client.user.displayName} Info`)
            .setDescription(application.description)
            .setThumbnail(clientUser.displayAvatarURL())
            .addFields(
                {
                    name: "Created",
                    value: time(clientUser.createdAt, "R"),
                    inline: true,
                },
                {
                    name: "Up Since",
                    value: time(client.readyAt, "R"),
                    inline: true,
                },
                {
                    name: "Owners",
                    value: client.owners
                        .map((user) => user.toString())
                        .join(", "),
                    inline: true,
                },
                {
                    name: "Database",
                    value: databaseStatus,
                    inline: true,
                },
                {
                    name: "Ping",
                    value: `${client.ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "Commands",
                    value: stores.get("commands").size.toString(),
                    inline: true,
                },
                {
                    name: "Servers",
                    value: client.guilds.cache.size.toString(),
                    inline: true,
                },
                {
                    name: "Users",
                    value: client.users.cache.size.toString(),
                    inline: true,
                },
            );

        return interaction.reply({
            embeds: [embed],
            flags: "Ephemeral",
        });
    }
}
