import { Command } from "@sapphire/framework";
import { ChannelType, Guild } from "discord.js";
import { capitalize } from "lodash";

export class ServerCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "server",
            description: "Server Info",
            runIn: "GUILD_ANY",
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
        );
    }

    /**
     * Execute Slash Command
     */
    chatInputRun = (interaction: Command.ChatInputCommandInteraction) =>
        interaction.reply({
            embeds: [this.generateEmbed(interaction.guild)],
            ephemeral: true,
        });

    /**
     * Create Embed for Server Info
     */
    private generateEmbed(guild: Guild | null) {
        const { util } = this.container;

        if (!guild)
            return util.embed().setDescription("Server could not be fetched");

        const {
            createdTimestamp,
            description,
            features,
            members,
            memberCount,
            channels,
            emojis,
            stickers,
        } = guild;

        const icon = guild.iconURL({ extension: "gif" }) as string;

        return util
            .embed()
            .setAuthor({ name: guild.name, iconURL: icon })
            .setThumbnail(icon)
            .addFields([
                {
                    name: "General",
                    value: `**Name** - ${guild.name}
                            **Created** - <t:${Math.floor(
                                createdTimestamp / 1000
                            )}:R>
                            **Owner** - ${guild.members.cache.get(
                                guild.ownerId
                            )}

                            **Description** - ${
                                description ? description : "None"
                            }

                            **Features** - ${features
                                .map((feature) =>
                                    feature
                                        .toLowerCase()
                                        .split("_")
                                        .map(
                                            (word) => `**${capitalize(word)}**`
                                        )
                                        .join(" ")
                                )
                                .join(", ")}`,
                },
                {
                    name: "👥| Users",
                    value: `- **Members**: ${
                        members.cache.filter((m) => !m.user.bot).size
                    }\n- **Bots**: ${
                        members.cache.filter((m) => m.user.bot).size
                    }\n- **Online**: ${
                        members.cache.filter(
                            (m) =>
                                m.presence?.status === "online" ||
                                m.presence?.status === "idle" ||
                                m.presence?.status === "dnd"
                        ).size
                    }\n\n**Total**: ${memberCount}`,
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
                        members.cache.filter((m) => m.premiumSince !== null)
                            .size
                    }`,
                },
            ]);
    }
}
