import { Embed } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ChannelType,
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";
import capitalize from "lodash/capitalize";

@SlashCommand({
    name: "server",
    description: "Server information",
    contexts: [InteractionContextType.Guild],
})
export default class ServerCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild } = interaction;

        const {
            createdTimestamp,
            description,
            features,
            channels,
            emojis,
            stickers,
        } = guild;

        const members = await guild.members.fetch();

        const icon = guild.iconURL({ extension: "gif" }) ?? "";

        const embed = new Embed()
            .setAuthor({ name: guild.name, iconURL: icon })
            .setThumbnail(icon)
            .addFields([
                {
                    name: "General",
                    value: `**Name** - ${guild.name}
                        **Created** - <t:${Math.floor(
                            createdTimestamp / 1000
                        )}:R>
                        **Owner** - ${guild.members.cache.get(guild.ownerId)}

                        **Description** - ${description ? description : "None"}

                        **Features** - ${features
                            .map((feature) =>
                                feature
                                    .toLowerCase()
                                    .split("_")
                                    .map((word) => `**${capitalize(word)}**`)
                                    .join(" ")
                            )
                            .join(", ")}`,
                },
                {
                    name: "👥 | Users",
                    value: `- **Members**: ${
                        members.filter((m) => !m.user.bot).size
                    }\n- **Bots**: ${
                        members.filter((m) => m.user.bot).size
                    }\n- **Online**: ${
                        members.filter(
                            (m) =>
                                m.presence?.status === "online" ||
                                m.presence?.status === "idle" ||
                                m.presence?.status === "dnd"
                        ).size
                    }\n\n**Total**: ${members.size}`,
                },
                {
                    name: "📃 | Channels",
                    value: `- **Text**: ${
                        channels.cache.filter(
                            (ch) => ch.type === ChannelType.GuildText
                        ).size
                    }\n- **Voice**: ${
                        channels.cache.filter(
                            (ch) => ch.type === ChannelType.GuildVoice
                        ).size
                    }\n- **Threads**: ${
                        channels.cache.filter(
                            (ch) =>
                                ch.type === ChannelType.AnnouncementThread ||
                                ch.type === ChannelType.PublicThread ||
                                ch.type === ChannelType.PrivateThread
                        ).size
                    }\n- Categories: ${
                        channels.cache.filter(
                            (ch) => ch.type === ChannelType.GuildCategory
                        ).size
                    }\n- Stages: ${
                        channels.cache.filter(
                            (ch) => ch.type === ChannelType.GuildStageVoice
                        ).size
                    }\n- News: ${
                        channels.cache.filter(
                            (ch) => ch.type === ChannelType.GuildAnnouncement
                        ).size
                    }\n\n**Total**: ${channels.cache.size}`,
                },
                {
                    name: "😯 | Emojis & Stickers",
                    value: `- **Animated**: ${
                        emojis.cache.filter((e) => e.animated === true).size
                    }\n- **Static**: ${
                        emojis.cache.filter((e) => !e.animated).size
                    }\n- **Stickers**: ${stickers.cache.size}\n\n**Total** - ${
                        emojis.cache.size + stickers.cache.size
                    }`,
                },
                {
                    name: "Nitro Statistics",
                    value: `- **Tier**: ${guild.premiumTier}\n- **Boosts**: ${
                        guild.premiumSubscriptionCount
                    }\n- **Boosters**: ${
                        members.filter((m) => m.premiumSince !== null).size
                    }`,
                },
            ]);

        interaction.reply({ embeds: [embed] });
    }
}
