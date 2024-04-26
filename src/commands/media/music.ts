import { Subcommand } from "@sapphire/plugin-subcommands";
import {
    GuildQueue,
    QueueRepeatMode,
    useMainPlayer,
    useQueue
} from "discord-player";
import { GuildMember } from "discord.js";
import { startCase } from "lodash";

export class MusicCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "music",
            description: "Music System for your server",
            subcommands: [
                {
                    name: "play",
                    chatInputRun: "slashPlay"
                },
                {
                    name: "pause",
                    chatInputRun: "slashPause"
                },
                {
                    name: "resume",
                    chatInputRun: "slashResume"
                },
                {
                    name: "skip",
                    chatInputRun: "slashSkip"
                },
                {
                    name: "stop",
                    chatInputRun: "slashStop"
                },
                {
                    name: "queue",
                    chatInputRun: "slashQueue"
                },
                {
                    name: "loop",
                    chatInputRun: "slashLoop"
                },
                {
                    name: "shuffle",
                    chatInputRun: "slashShuffle"
                },
                {
                    name: "volume",
                    chatInputRun: "slashVolume"
                },
                {
                    name: "seek",
                    chatInputRun: "slashSeek"
                },
                {
                    name: "lyrics",
                    chatInputRun: "slashLyrics"
                },
                {
                    name: "nowplaying",
                    chatInputRun: "slashNowPlaying"
                },
                {
                    name: "remove",
                    chatInputRun: "slashRemove"
                },
                {
                    name: "search",
                    chatInputRun: "slashSearch"
                }
            ],
            preconditions: ["InDevelopment"]
        });
    }

    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("play")
                        .setDescription("Play a song")
                        .addStringOption((option) =>
                            option
                                .setName("track_or_playlist_url")
                                .setDescription("The track or playlist URL")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command.setName("pause").setDescription("Pause the player")
                )
                .addSubcommand((command) =>
                    command
                        .setName("resume")
                        .setDescription("Resume the player")
                )
                .addSubcommand(
                    (command) =>
                        command
                            .setName("skip")
                            .setDescription("Skip the current track")
                    /*.addStringOption((option) =>
                            option
                                .setName("track_in_queue")
                                .setDescription("Track to skip to")
                                .setAutocomplete(true)
                        )*/
                )
                .addSubcommand((command) =>
                    command.setName("stop").setDescription("Stop the player")
                )
                .addSubcommand((command) =>
                    command.setName("queue").setDescription("Show the queue")
                )
                .addSubcommand((command) =>
                    command
                        .setName("loop")
                        .setDescription("Loop the current track")
                        .addIntegerOption((option) =>
                            option
                                .setName("loop_mode")
                                .setDescription("How to loop?")
                                .setChoices(
                                    {
                                        name: "Track",
                                        value: QueueRepeatMode.TRACK
                                    },
                                    {
                                        name: "Queue",
                                        value: QueueRepeatMode.QUEUE
                                    },
                                    {
                                        name: "Off",
                                        value: QueueRepeatMode.OFF
                                    }
                                )
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("shuffle")
                        .setDescription("Shuffle the queue")
                )
                .addSubcommand((command) =>
                    command
                        .setName("volume")
                        .setDescription("Change the volume")
                        .addIntegerOption((option) =>
                            option
                                .setName("volume")
                                .setDescription("The volume to set")
                                .setRequired(true)
                        )
                )
                /*.addSubcommand((command) =>
                    command
                        .setName("seek")
                        .setDescription("Seek to a position")
                        .addIntegerOption((option) =>
                            option
                                .setName("position")
                                .setDescription("The position to seek to")
                                .setRequired(true)
                        )
                )*/
                .addSubcommand((command) =>
                    command
                        .setName("lyrics")
                        .setDescription("Get the lyrics of the current track")
                )
                .addSubcommand((command) =>
                    command
                        .setName("nowplaying")
                        .setDescription("Show the current track")
                )
                .addSubcommand((command) =>
                    command
                        .setName("remove")
                        .setDescription("Remove a track from the queue")
                        .addStringOption((option) =>
                            option
                                .setName("track_in_queue")
                                .setDescription("The track to remove")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("search")
                        .setDescription("Search for a track")
                        .addStringOption((option) =>
                            option
                                .setName("query")
                                .setDescription("The query to search for")
                                .setRequired(true)
                        )
                )
        );
    }

    async slashPlay(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!member || !guild) return;
        if (!(member instanceof GuildMember)) return;

        if (!member.voice.channel)
            return interaction.reply({
                content:
                    "> 🚫 You have to be in a voice channel to use this command",
                ephemeral: true
            });

        const { options } = interaction;

        const query = options.getString("track_or_playlist_url", true);

        await interaction.deferReply({ ephemeral: true });

        const player = useMainPlayer();
        const search = await player.search(query, {
            requestedBy: interaction.user
        });

        if (search.isEmpty())
            return interaction.reply({
                content: "No results found.",
                ephemeral: true
            });

        const {
            systems: { music },
            util
        } = this.container;

        let queue: GuildQueue | null = null;
        if (useQueue(guild.id)) queue = useQueue(guild.id);

        if (search.hasPlaylist() && search.playlist) {
            if (queue && !queue.isEmpty()) {
                const { playlist } = search;

                queue.addTrack(playlist.tracks);

                const embed = util
                    .embed()
                    .setAuthor({
                        name: "Added a playlist to the queue"
                    })
                    .setDescription(
                        `**${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) [${playlist.tracks.length} Tracks]**`
                    )
                    .setThumbnail(playlist.thumbnail)
                    .setURL(playlist.url);

                return music.showPlaylistTracks(
                    await interaction.editReply({
                        embeds: [embed]
                    }),
                    playlist
                );
            }

            await player.play(member.voice.channel, search.playlist, {
                nodeOptions: {
                    metadata: {
                        interaction,
                        channel: interaction.channel
                    }
                },
                requestedBy: interaction.user
            });

            return interaction.editReply({
                content: `Now playing: [${search.playlist.title}](${search.playlist.url})`
            });
        }

        if (queue && !queue.isEmpty()) {
            queue.addTrack(search.tracks[0]);
            return interaction.editReply({
                content: `Added to the queue: [${search.tracks[0].title}](${search.tracks[0].url})`
            });
        }

        await player.play(member.voice.channel, search.tracks[0], {
            nodeOptions: {
                metadata: {
                    interaction,
                    channel: interaction.channel
                }
            },
            requestedBy: interaction.user
        });

        return interaction.editReply({
            content: `Now playing: [${search.tracks[0].title}](${search.tracks[0].url})`
        });
    }

    async slashPause(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        if (queue.node.isPaused())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **The player is already paused**`,
                ephemeral: true
            });

        queue.node.pause();

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Paused the player**`,
            ephemeral: true
        });
    }

    async slashResume(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        if (!queue.node.isPaused())
            return interaction.reply({
                content: `${util.toEmoji(emojis.get("no") ?? "🚫")} **The player is not paused**`,
                ephemeral: true
            });

        queue.node.resume();

        return interaction.reply({
            content: `${util.toEmoji(emojis.get("yes") ?? "✅")} **Resumed the player**`,
            ephemeral: true
        });
    }

    async slashSkip(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        const { options } = interaction;

        const trackId = options.getString("track_in_queue");
        if (!trackId) {
            queue.node.skip();
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Skipped the current track**`,
                ephemeral: true
            });
        }

        const track = queue.tracks.find((t) => t.id === trackId);

        if (!track)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Track not found**`,
                ephemeral: true
            });

        queue.node.jump(track);

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Skipped to [${track.title}](${track.url}) - ${track.author}**`,
            ephemeral: true
        });
    }

    async slashStop(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        queue.node.stop();

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Stopped the player**`,
            ephemeral: true
        });
    }

    async slashQueue(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const {
            emojis,
            systems: { music },
            util
        } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        return music.showQueue(interaction, queue);
    }

    async slashLoop(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        const { options } = interaction;

        const loopMode = options.getInteger("loop_mode", true);

        queue.setRepeatMode(loopMode);

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Loop mode set to ${
                loopMode === QueueRepeatMode.TRACK
                    ? "Track"
                    : loopMode === QueueRepeatMode.QUEUE
                      ? "Queue"
                      : "Off"
            }**`,
            ephemeral: true
        });
    }

    async slashShuffle(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        queue.tracks.shuffle();

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Shuffled the queue**`,
            ephemeral: true
        });
    }

    async slashVolume(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        const { options } = interaction;

        const volume = options.getInteger("volume", true);

        queue.node.setVolume(volume);

        return interaction.reply({
            content: `${await util.toEmoji(emojis.get("yes") ?? "✅")} **Volume set to ${volume}%**`,
            ephemeral: true
        });
    }

    async slashLyrics(interaction: Subcommand.ChatInputCommandInteraction) {
        const { member, guild } = interaction;
        if (!(member instanceof GuildMember) || !guild) return;

        const { emojis, systems, util } = this.container;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in a voice channel to use this command**`,
                ephemeral: true
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **You have to be in the same voice channel as me to use this command**`,
                ephemeral: true
            });

        const queue = useQueue(guild);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} **Music is not playing**`,
                ephemeral: true
            });

        return systems.music.showLyrics(interaction, queue);
    }
}
