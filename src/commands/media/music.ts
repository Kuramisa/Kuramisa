import { Embed, IntegerOption, StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import { QueueRepeatMode, useMainPlayer, useQueue } from "discord-player";
import {
    type GuildTextBasedChannel,
    InteractionContextType,
    type ChatInputCommandInteraction,
} from "discord.js";
import startCase from "lodash/startCase";
import { durationPattern, durationToMs } from "utils";

@SlashCommand({
    name: "music",
    description: "Music commands",
    contexts: [InteractionContextType.Guild],
    subcommands: [
        {
            name: "play",
            description: "Play a song",
            options: [
                new StringOption()
                    .setName("track_or_playlist_name_or_url")
                    .setDescription("The track or playlist Name or URL")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "pause",
            description: "Pause the current song",
        },
        {
            name: "resume",
            description: "Resume the current song",
        },
        {
            name: "skip",
            description: "Skip the current song or to a specific song",
            options: [
                new StringOption()
                    .setName("track_in_queue")
                    .setDescription("Track to skip to")
                    .setAutocomplete(true)
                    .setRequired(false),
            ],
        },
        {
            name: "stop",
            description: "Stop the current song",
        },
        {
            name: "queue",
            description: "Show the queue",
        },
        {
            name: "loop",
            description: "Loop modes",
            options: [
                new IntegerOption()
                    .setName("loop_mode")
                    .setDescription("How to loop?")
                    .setChoices(
                        {
                            name: "Track",
                            value: QueueRepeatMode.TRACK,
                        },
                        {
                            name: "Queue",
                            value: QueueRepeatMode.QUEUE,
                        },
                        {
                            name: "Off",
                            value: QueueRepeatMode.OFF,
                        }
                    ),
            ],
        },
        {
            name: "shuffle",
            description: "Shuffle the queue",
        },
        {
            name: "volume",
            description: "Change the volume",
            options: [
                new IntegerOption()
                    .setName("volume")
                    .setDescription("The volume to set")
                    .setMinValue(0)
                    .setMaxValue(100),
            ],
        },
        {
            name: "seek",
            description: "Seek to a specific time in the track",
            options: [
                new StringOption()
                    .setName("seek_time")
                    .setDescription("The time to seek to")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "nowplaying",
            description: "Get the current song",
        },
        {
            name: "remove",
            description: "Remove a song from the queue",
            options: [
                new StringOption()
                    .setName("track_in_queue")
                    .setDescription("The track to remove")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "clear",
            description: "Clear the queue",
        },
        {
            name: "search",
            description: "Search for a song",
            options: [
                new StringOption()
                    .setName("track_or_playlist_name_or_url")
                    .setDescription("The track or playlist Name or URL")
                    .setAutocomplete(true),
            ],
        },
    ],
    groups: [
        {
            name: "lyrics",
            description: "Lyrics commands",
            subcommands: [
                {
                    name: "search",
                    description: "Search for lyrics",
                    options: [
                        new StringOption()
                            .setName("track_or_playlist_name_or_url")
                            .setDescription("The track or playlist Name or URL")
                            .setAutocomplete(true),
                    ],
                },
                {
                    name: "current-track",
                    description: "Get the lyrics of the current track",
                },
            ],
        },
    ],
})
export default class MusicCommand extends AbstractSlashCommand {
    async slashPlay(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        const { options } = interaction;

        const query = options.getString("track_or_playlist_name_or_url", true);

        await interaction.deferReply({ ephemeral: true });

        const player = useMainPlayer();
        const search = await player.search(query, {
            requestedBy: interaction.user,
        });

        if (search.isEmpty())
            return interaction.reply({
                content: "No results found.",
                flags: ["Ephemeral"],
            });

        const {
            systems: { music },
        } = this.client;

        const queue = useQueue(guild);

        if (search.hasPlaylist() && search.playlist) {
            if (queue && !queue.isEmpty()) {
                const { playlist } = search;

                queue.addTrack(playlist.tracks);

                const embed = new Embed()
                    .setAuthor({
                        name: "Added a playlist to the queue",
                    })
                    .setDescription(
                        `**${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) [${playlist.tracks.length} Tracks]**`
                    )
                    .setThumbnail(playlist.thumbnail)
                    .setURL(playlist.url);

                return music.showPlaylistTracks(
                    await interaction.editReply({
                        embeds: [embed],
                    }),
                    playlist
                );
            }

            await player.play(member.voice.channel, search.playlist, {
                nodeOptions: {
                    metadata: interaction.channel,
                },
                requestedBy: interaction.user,
            });

            return interaction.editReply({
                content: `Now playing: [${search.playlist.title}](${search.playlist.url})`,
            });
        }

        if (queue && !queue.isEmpty()) {
            queue.addTrack(search.tracks[0]);
            return interaction.editReply({
                content: `Added to the queue: [${search.tracks[0].title}](${search.tracks[0].url})`,
            });
        }

        await player.play(member.voice.channel, search.tracks[0], {
            nodeOptions: {
                metadata: interaction.channel,
            },
            requestedBy: interaction.user,
        });

        return interaction.editReply({
            content: `Now playing: [${search.tracks[0].title}](${search.tracks[0].url})`,
        });
    }

    async slashPause(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        if (queue.node.isPaused())
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **The player is already paused**`,
                flags: ["Ephemeral"],
            });

        queue.node.pause();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Paused the player**`,
            flags: ["Ephemeral"],
        });
    }

    async slashResume(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        if (!queue.node.isPaused())
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **The player is not paused**`,
                flags: ["Ephemeral"],
            });

        queue.node.resume();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Resumed the player**`,
            flags: ["Ephemeral"],
        });
    }

    async slashSkip(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        const { options } = interaction;

        const trackId = options.getString("track_in_queue");
        if (!trackId) {
            queue.node.skip();
            return interaction.reply({
                content: `${emojis.get("yes") ?? "✅"} **Skipped the current track**`,
                flags: ["Ephemeral"],
            });
        }

        const track = queue.tracks.find((t) => t.id === trackId);

        if (!track)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Track not found**`,
                flags: ["Ephemeral"],
            });

        queue.node.jump(track);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Skipped to [${track.title}](${track.url}) - ${track.author}**`,
            flags: ["Ephemeral"],
        });
    }

    async slashStop(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        queue.node.stop();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Stopped the player**`,
            flags: ["Ephemeral"],
        });
    }

    async slashQueue(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const {
            kEmojis: emojis,
            systems: { music },
        } = this.client;

        const queue = useQueue<GuildTextBasedChannel>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        return music.showQueue(interaction, queue);
    }

    async slashLoop(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        const { options } = interaction;

        const loopMode = options.getInteger("loop_mode", true);

        queue.setRepeatMode(loopMode as QueueRepeatMode);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Loop mode set to ${
                loopMode === QueueRepeatMode.TRACK
                    ? "Track"
                    : loopMode === QueueRepeatMode.QUEUE
                      ? "Queue"
                      : "Off"
            }**`,
            flags: ["Ephemeral"],
        });
    }

    async slashShuffle(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        queue.tracks.shuffle();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Shuffled the queue**`,
            flags: ["Ephemeral"],
        });
    }

    async slashSeek(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!queue.currentTrack)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **No track is currently playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        const { options } = interaction;

        const seekTimeStr = options.getString("seek_time", true);

        if (!durationPattern.test(seekTimeStr))
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Invalid duration format**`,
                flags: ["Ephemeral"],
            });

        const seekTime = durationToMs(seekTimeStr);

        if (seekTime < 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Seek time cannot be negative**`,
                flags: ["Ephemeral"],
            });

        if (seekTime > queue.currentTrack.durationMS)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Seek time cannot be greater than the track duration**`,
                flags: ["Ephemeral"],
            });

        queue.node.seek(seekTime);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Seeked to ${seekTimeStr}**`,
            flags: ["Ephemeral"],
        });
    }

    async slashVolume(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        const { options } = interaction;

        const volume = options.getInteger("volume", true);

        queue.node.setVolume(volume);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Volume set to ${volume}%**`,
            flags: ["Ephemeral"],
        });
    }

    async slashLyricsCurrentTrack(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, guild } = interaction;
        const { kEmojis: emojis, systems } = this.client;

        const queue = useQueue(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: ["Ephemeral"],
            });

        if (!queue.currentTrack)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} No track is currently playing`,
                flags: ["Ephemeral"],
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: ["Ephemeral"],
            });

        if (member.voice.channelId !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: ["Ephemeral"],
            });

        return systems.music.showLyrics(interaction, queue.currentTrack);
    }

    async slashLyricsSearch(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const {
            systems: { music },
        } = this.client;

        const query = options.getString("track_or_playlist_name_or_url", true);

        const result = await music.search(query);

        if (!result)
            return interaction.reply({
                content: "No results found.",
                flags: ["Ephemeral"],
            });

        return music.showLyrics(interaction, result.tracks[0]);
    }
}
