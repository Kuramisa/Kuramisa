import { Embed } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    time,
} from "discord.js";

@SlashCommand({
    name: "bot-info",
    aliases: ["botinfo", "bot"],
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
    messageRun(message: Message) {
        const {
            client: {
                application,
                database,
                guilds,
                readyAt,
                stores,
                owners,
                user,
                users,
                ws,
            },
        } = message;

        const databaseStatus = [
            "Disconnected",
            "Connected",
            "Connecting",
            "Disconnecting",
        ][database.connection.connection.readyState];

        const embed = new Embed()
            .setTitle(`${user.displayName} Info`)
            .setDescription(application.description)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: "Created",
                    value: time(user.createdAt, "R"),
                    inline: true,
                },
                {
                    name: "Up Since",
                    value: time(readyAt, "R"),
                    inline: true,
                },
                {
                    name: "Owners",
                    value: owners.map((user) => user.toString()).join(", "),
                    inline: true,
                },
                {
                    name: "Database",
                    value: databaseStatus,
                    inline: true,
                },
                {
                    name: "Ping",
                    value: `${ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "Commands",
                    value: stores.get("commands").size.toString(),
                    inline: true,
                },
                {
                    name: "Servers",
                    value: guilds.cache.size.toString(),
                    inline: true,
                },
                {
                    name: "Users",
                    value: users.cache.size.toString(),
                    inline: true,
                },
            );

        return message.reply({
            embeds: [embed],
        });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        const {
            client: {
                application,
                database,
                guilds,
                readyAt,
                stores,
                owners,
                user,
                users,
                ws,
            },
        } = interaction;

        const databaseStatus = [
            "Disconnected",
            "Connected",
            "Connecting",
            "Disconnecting",
        ][database.connection.connection.readyState];

        const embed = new Embed()
            .setTitle(`${user.displayName} Info`)
            .setDescription(application.description)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: "Created",
                    value: time(user.createdAt, "R"),
                    inline: true,
                },
                {
                    name: "Up Since",
                    value: time(readyAt, "R"),
                    inline: true,
                },
                {
                    name: "Owners",
                    value: owners.map((user) => user.toString()).join(", "),
                    inline: true,
                },
                {
                    name: "Database",
                    value: databaseStatus,
                    inline: true,
                },
                {
                    name: "Ping",
                    value: `${ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "Commands",
                    value: stores.get("commands").size.toString(),
                    inline: true,
                },
                {
                    name: "Servers",
                    value: guilds.cache.size.toString(),
                    inline: true,
                },
                {
                    name: "Users",
                    value: users.cache.size.toString(),
                    inline: true,
                },
            );

        return interaction.reply({
            embeds: [embed],
            flags: "Ephemeral",
        });
    }
}
