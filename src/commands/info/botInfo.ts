import { KEmbed } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChannelType, ChatInputCommandInteraction, version } from "discord.js";
import os from "os";

@SlashCommand({
    name: "bot-info",
    description: "Bot Info"
})
export default class BotInfoCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { client } = this;
        const { database, stores } = client;

        const clientUser = await client.user?.fetch();
        if (!clientUser) return;

        const application = await client.application?.fetch();
        if (!application) return;

        const channelSize = (type: ChannelType[]) =>
            client.channels.cache.filter((channel) =>
                type.includes(channel.type)
            ).size;

        const mongoStatus = [
            "Disconnected",
            "Connected",
            "Connecting",
            "Disconnecting"
        ];

        const embed = new KEmbed()
            .setTitle(`${clientUser.username} Information`)
            .setThumbnail(clientUser.displayAvatarURL({ extension: "png" }))
            .addFields([
                {
                    name: "Client",
                    value: `${clientUser.tag}`,
                    inline: true
                },
                {
                    name: "Created",
                    value: `<t:${Math.floor(
                        clientUser.createdTimestamp / 1000
                    )}:R>`,
                    inline: true
                },
                {
                    name: "Verified",
                    value: clientUser.flags?.has("VerifiedBot") ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "Owners",
                    value: this.client.owners
                        .map((owner) => owner.toString())
                        .join(", "),
                    inline: true
                },
                {
                    name: "Database",
                    value: mongoStatus[
                        database.connection.connection.readyState
                    ],
                    inline: true
                },
                {
                    name: "System",
                    value: os
                        .type()
                        .replace("Windows_NT", "Windows")
                        .replace("Darwin", "macOS"),
                    inline: true
                },
                {
                    name: "CPU Model",
                    value: os.cpus()[0].model,
                    inline: true
                },
                {
                    name: "Up Since",
                    value: `<t:${Math.floor((client.readyTimestamp ?? 0) / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "Node.js",
                    value: process.version,
                    inline: true
                },
                {
                    name: "Discord.js",
                    value: version,
                    inline: true
                },
                {
                    name: "Ping",
                    value: `${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: "Commands",
                    value: `${stores.commands.commands.size}`,
                    inline: true
                },
                {
                    name: "Events",
                    value: `${stores.events.events.size}`,
                    inline: true
                },
                {
                    name: "Server",
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: "Users",
                    value: `${client.users.cache.size}`,
                    inline: true
                },
                {
                    name: "Text Channels",
                    value: `${channelSize([
                        ChannelType.GuildText,
                        ChannelType.GuildAnnouncement
                    ])}`,
                    inline: true
                },
                {
                    name: "Voice Channels",
                    value: `${channelSize([
                        ChannelType.GuildVoice,
                        ChannelType.GuildStageVoice
                    ])}`,
                    inline: true
                },
                {
                    name: "Threads",
                    value: `${channelSize([
                        ChannelType.PublicThread,
                        ChannelType.PrivateThread,
                        ChannelType.AnnouncementThread
                    ])}`,
                    inline: true
                }
            ]);

        if (application.description)
            embed.setDescription(application.description);

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
