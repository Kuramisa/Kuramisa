import { Subcommand } from "@sapphire/plugin-subcommands";
import { QueueRepeatMode, Track } from "discord-player";
import { ChannelType } from "discord.js";
import _ from "lodash";

// TODO: add more commands for music
export class MusicCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "music",
            description: "Music Player",
            subcommands: [
                {
                    name: "play",
                    chatInputRun: "slashPlay",
                },
                {
                    name: "skip",
                    chatInputRun: "slashSkip",
                },
                {
                    name: "volume",
                    chatInputRun: "slashVolume",
                },
                {
                    name: "loop",
                    chatInputRun: "slashLoop",
                },
                {
                    name: "queue",
                    chatInputRun: "slashQueue",
                },
                {
                    name: "nowplaying",
                    chatInputRun: "slashNowPlaying",
                },
                {
                    name: "pause",
                    chatInputRun: "slashPause",
                },
                {
                    name: "resume",
                    chatInputRun: "slashResume",
                },
                {
                    name: "stop",
                    chatInputRun: "slashStop",
                },
            ],
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("play")
                        .setDescription("Play a song/playlist/URL")
                        .addStringOption((option) =>
                            option
                                .setName("song_or_playlist_or_url")
                                .setDescription("Song/Playlist/URL")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("skip")
                        .setDescription("Skip the current or to a song")
                        .addStringOption((option) =>
                            option
                                .setName("song_to_skip_to")
                                .setDescription("Song to skip to")
                                .setAutocomplete(true)
                                .setRequired(false)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("volume")
                        .setDescription("View/Change volume of music")
                        .addIntegerOption((option) =>
                            option
                                .setName("volume")
                                .setDescription("Volume to set (0-100)")
                                .setMinValue(0)
                                .setMinValue(100)
                                .setRequired(false)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("loop")
                        .setDescription(
                            "View/Change loop of current track/queue"
                        )
                        .addStringOption((option) =>
                            option
                                .setName("loop_type")
                                .setDescription(
                                    "How do you want to loop the music?"
                                )
                                .setRequired(false)
                                .setChoices(
                                    { name: "🎵 Loop Track", value: "track" },
                                    {
                                        name: "🎶 Loop Queue",
                                        value: "queue",
                                    },
                                    {
                                        name: "🔀 AutoPlay Similar Songs",
                                        value: "autoplay",
                                    },
                                    { name: "❌ Off", value: "off" }
                                )
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("queue")
                        .setDescription("View Current Queue")
                )
                .addSubcommand((command) =>
                    command
                        .setName("nowplaying")
                        .setDescription("View Current Track")
                )
                .addSubcommand((command) =>
                    command
                        .setName("pause")
                        .setDescription("Pause the current track")
                )
                .addSubcommand((command) =>
                    command
                        .setName("resume")
                        .setDescription("Resume the current track")
                )
                .addSubcommand((command) =>
                    command.setName("stop").setDescription("Stop the player")
                )
        );
    }

    async slashPlay(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild, member, options, channel } = interaction;
        if (!guild) return;

        if (!guild?.members.me?.permissions.has("Connect"))
            return interaction.reply({
                content:
                    "> 🚫 **I do not have permission to connect to voice channels**",
                ephemeral: true,
            });

        if (!channel) return;

        if (
            channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildVoice
        )
            return interaction.reply({
                content:
                    "> 🚫 **This command can only be used in a text channel**",
                ephemeral: true,
            });

        if (!guild?.members.me?.permissions.has("Connect"))
            return interaction.reply({
                content:
                    "> 🚫 **I do not have permission to connect to voice channels**",
                ephemeral: true,
            });

        if (!guild?.members.me?.permissions.has("Speak"))
            return interaction.reply({
                content:
                    "> 🚫 **I do not have permission to speak in voice channels**",
                ephemeral: true,
            });

        const {
            voice: { channel: voiceChannel },
        } = member;

        if (!voiceChannel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me.voice.channelId &&
            voiceChannel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        if (voiceChannel.type !== ChannelType.GuildVoice)
            return interaction.reply({
                content:
                    "> 🚫 **This command can only be while you are in a voice channel**",
                ephemeral: true,
            });

        await interaction.deferReply({ ephemeral: true });

        const {
            systems: { music },
        } = this.container;

        let queue = music.queues.get(guild.id);
        if (!queue) queue = await music.newQueue(interaction, guild, channel);

        const query = options.getString("song_or_playlist_or_url", true);

        const searchResult = await music.search(query, {
            requestedBy: interaction.user,
        });

        if (searchResult.playlist) {
            const { playlist } = searchResult;

            queue.addTrack(playlist.tracks);

            if (!queue.isPlaying())
                await music.play(voiceChannel, playlist.tracks, {
                    requestedBy: member,
                });

            await interaction.followUp({
                content: `> 🎶 **Added Playlist *${playlist?.title} - ${playlist?.author}* to queue**`,
            });
        } else {
            const track = searchResult.tracks[0];

            if (queue.isPlaying()) {
                queue.addTrack(track);
            } else {
                await music.play(voiceChannel, track, {
                    requestedBy: member,
                });
            }

            await interaction.followUp({
                content: `> 🎶 **Added Track *${track.title} - ${track.author}* to queue**`,
                ephemeral: true,
            });
        }
    }

    async slashSkip(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member, options } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        const currentTrack = queue.currentTrack;

        if (currentTrack) {
            const requestedBy = currentTrack.requestedBy;
            if (requestedBy && requestedBy.id !== member.id)
                return interaction.reply({
                    content: `> 🚫 You didn't request current track playing, ask ${requestedBy} to skip the track, as they requested it`,
                    ephemeral: true,
                });
        }

        const skipTo = options.getString("song_to_skip_to");
        if (!skipTo) {
            queue.node.skip();
            return interaction.reply({
                content: "> ⏭️ Current Track Skipped",
                ephemeral: true,
            });
        }

        const trackToSkipTo = queue.tracks.find(
            (track: Track) => track.url === skipTo
        );
        if (!trackToSkipTo)
            return interaction.reply({
                content: "> 🚫 Track you provided doesn't exist",
                ephemeral: true,
            });

        queue.node.skipTo(trackToSkipTo);

        return interaction.reply({
            content: `> ⏭️ Skipped to: **${trackToSkipTo.title} - ${trackToSkipTo.author}**`,
            ephemeral: true,
        });
    }

    async slashVolume(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member, options } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        const volume = options.getInteger("volume");
        if (!volume) {
            const currentVolume = queue.node.volume;
            const speakerEmoji = this.volumeEmoji(currentVolume);

            return interaction.reply({
                content: `> ${speakerEmoji} Current Volume is **${currentVolume}%**`,
                ephemeral: true,
            });
        }

        if (volume < 0 || volume > 100)
            return interaction.reply({
                content: "> 🚫 Volume must be between 0 and 100",
                ephemeral: true,
            });

        queue.node.setVolume(volume);

        const speakerEmoji = this.volumeEmoji(volume);
        return interaction.reply({
            content: `> ${speakerEmoji} Volume set to **${volume}%**`,
        });
    }

    async slashLoop(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member, options } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        const loopType = options.getString("loop_type");
        if (!loopType) {
            let currentLoopType;
            switch (queue.repeatMode) {
                case 0:
                    currentLoopType = "❌ Off";
                    break;
                case 1:
                    currentLoopType = "🎵 Track";
                    break;
                case 2:
                    currentLoopType = "🎶 Queue";
                    break;
                case 3:
                    currentLoopType = "🔀 AutoPlay";
                    break;
                default:
                    currentLoopType = "❌ Unknown";
                    break;
            }

            return interaction.reply({
                content: `> Current Loop is **${currentLoopType}**`,
                ephemeral: true,
            });
        }

        let currentlyLooping;

        switch (loopType) {
            case "track":
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                currentlyLooping = "🎵 Track";
                break;
            case "queue":
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                currentlyLooping = "🎶 Queue";
                break;
            case "autoplay":
                queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
                currentlyLooping = "🔀 AutoPlay";
                break;
            case "off":
                queue.setRepeatMode(QueueRepeatMode.OFF);
                currentlyLooping = "❌ Off";
                break;
            default:
                currentlyLooping = "❌ Unknown";
                break;
        }

        return interaction.reply({
            content: `> Looping **${currentlyLooping}**`,
            ephemeral: true,
        });
    }

    async slashQueue(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild } = interaction;

        const {
            systems: { music },
            util,
        } = this.container;

        const queue = music.queues.get(guild);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        let tracks = queue.tracks.map(
            (track: Track, index: number) =>
                `\`${index + 1}\`, ${track.title} - ${track.author} | ${
                    track.duration
                }`
        );
        tracks = _.chunk(tracks, 10).flat();

        if (tracks.length < 1)
            return interaction.reply({
                content: "> ❌ There are no upcoming tracks",
            });

        await util.pagination.embedContents(
            interaction,
            tracks,
            "Current Queue"
        );
    }

    async slashNowPlaying(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild, member } = interaction;

        const {
            client,
            systems: { music },
            util,
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        const currentTrack = queue.currentTrack;
        if (!currentTrack)
            return interaction.reply({
                content: "> 🚫 **There is no track playing**",
                ephemeral: true,
            });

        const embed = util
            .embed()
            .setAuthor({
                name: "Now Playing",
                iconURL: client.user?.displayAvatarURL(),
            })
            .setTitle(currentTrack.title)
            .setURL(currentTrack.url)
            .setThumbnail(
                (currentTrack.raw.thumbnail as any)
                    ? (currentTrack.raw.thumbnail as any).url
                    : currentTrack.thumbnail
            )
            .addFields({
                name: "Duration",
                value: currentTrack.duration,
            })
            .setFooter({
                text: `Requested by ${currentTrack.requestedBy?.tag}`,
                iconURL: currentTrack.requestedBy?.displayAvatarURL(),
            });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }

    async slashPause(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        if (queue.node.isPaused())
            return interaction.reply({
                content: "> 🚫 **The player is already paused**",
                ephemeral: true,
            });

        queue.node.setPaused(true);

        return interaction.reply({
            content: "> ⏸️ **Paused the player**",
            ephemeral: true,
        });
    }

    async slashResume(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild.id);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });

        if (!queue.node.isPaused())
            return interaction.reply({
                content: "> 🚫 **The player is playing**",
                ephemeral: true,
            });

        queue.node.setPaused(false);

        return interaction.reply({
            content: "> ⏸️ **Resumed the player**",
            ephemeral: true,
        });
    }

    async slashStop(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, member } = interaction;

        const {
            systems: { music },
        } = this.container;

        const queue = music.queues.get(guild);

        if (!queue)
            return interaction.reply({
                content: "> 🚫 **There is no music playing**",
                ephemeral: true,
            });

        const {
            voice: { channel },
        } = member;

        if (!channel)
            return interaction.reply({
                content:
                    "> 🚫 **You must be in a voice channel to use this command**",
                ephemeral: true,
            });

        if (
            guild.members.me?.voice.channelId &&
            channel.id !== guild.members.me.voice.channelId
        )
            return interaction.reply({
                content:
                    "> 🚫 **You must be in the same voice channel as me to use this command**",
                ephemeral: true,
            });
    }

    private volumeEmoji(volume: number) {
        let speakerEmoji = "🔇";
        if (volume <= 100 && volume >= 75) speakerEmoji = "🔊";
        else if (volume <= 75 && volume >= 25) speakerEmoji = "🔉";
        else if (volume <= 25 && volume > 0) speakerEmoji = "🔈";

        return speakerEmoji;
    }
}
