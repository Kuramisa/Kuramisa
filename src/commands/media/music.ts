import {
    Button,
    Embed,
    IntegerOption,
    Row,
    StringDropdown,
    StringOption,
} from "@builders";
import {
    AbstractSlashSubcommand,
    SlashSubcommand,
} from "@classes/SlashSubcommand";
import { chunk } from "@sapphire/utilities";
import type { QueueMetadata } from "@typings/Music";
import { durationPattern, durationToMs } from "@utils";
import { QueueRepeatMode, type QueueFilters } from "discord-player";
import {
    ActionRowBuilder,
    bold,
    ChannelType,
    ComponentType,
    type ChatInputCommandInteraction,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import startCase from "lodash/startCase";

@SlashSubcommand({
    name: "music",
    description: "Music commands",
    subcommands: [
        {
            name: "play",
            description: "Play a song",
            chatInputRun: "slashPlay",
            opts: [
                new StringOption()
                    .setName("track_or_playlist_name_or_url")
                    .setDescription("The track or playlist Name or URL")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "pause",
            description: "Pause the current song",
            chatInputRun: "slashPause",
        },
        {
            name: "resume",
            description: "Resume the current song",
            chatInputRun: "slashResume",
        },
        {
            name: "skip",
            description: "Skip the current song or to a specific song",
            chatInputRun: "slashSkip",
            opts: [
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
            chatInputRun: "slashStop",
        },
        {
            name: "queue",
            description: "Show the queue",
            chatInputRun: "slashQueue",
        },
        {
            name: "loop",
            description: "Loop modes",
            chatInputRun: "slashLoop",
            opts: [
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
                        },
                    ),
            ],
        },
        {
            name: "shuffle",
            description: "Shuffle the queue",
            chatInputRun: "slashShuffle",
        },
        {
            name: "volume",
            description: "Change the volume",
            chatInputRun: "slashVolume",
            opts: [
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
            chatInputRun: "slashSeek",
            opts: [
                new StringOption()
                    .setName("seek_time")
                    .setDescription("The time to seek to")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "now-playing",
            description: "Get the current song",
            chatInputRun: "slashNowPlaying",
        },
        {
            name: "remove",
            description: "Remove a song from the queue",
            chatInputRun: "slashRemove",
            opts: [
                new StringOption()
                    .setName("track_in_queue")
                    .setDescription("The track to remove")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "clear",
            description: "Clear the queue",
            chatInputRun: "slashClear",
        },
        {
            name: "search",
            description: "Search for a song",
            chatInputRun: "slashSearch",
            opts: [
                new StringOption()
                    .setName("track_or_playlist_name_or_url")
                    .setDescription("The track or playlist Name or URL")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "lyrics",
            description: "Lyrics commands",
            type: "group",
            entries: [
                {
                    name: "search",
                    description: "Search for lyrics",
                    chatInputRun: "slashLyricsSearch",
                    opts: [
                        new StringOption()
                            .setName("track_or_playlist_name_or_url")
                            .setDescription("The track or playlist Name or URL")
                            .setAutocomplete(true),
                    ],
                },
                {
                    name: "current-track",
                    description: "Get the lyrics of the current track",
                    chatInputRun: "slashLyricsCurrentTrack",
                },
            ],
        },
        {
            name: "filters",
            description: "Toggle the filters",
            type: "group",
            entries: [
                {
                    name: "toggle",
                    description: "Toggle a filter",
                    chatInputRun: "slashFiltersToggle",
                    opts: [
                        new StringOption()
                            .setName("player_filters")
                            .setDescription("The filters to toggle")
                            .setAutocomplete(true)
                            .setRequired(false),
                    ],
                },
            ],
        },
    ],
})
export default class MusicCommand extends AbstractSlashSubcommand {
    async slashPlay(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.channel) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (guild.members.me && guild.members.me.voice.channelId) {
            if (member.voice.channel.id !== guild.members.me.voice.channelId)
                return interaction.reply({
                    content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                    flags: "Ephemeral",
                });
        }

        if (member.voice.channel.type !== ChannelType.GuildVoice)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.deaf)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You cannot use this command while deafened**`,
                flags: "Ephemeral",
            });

        const { options } = interaction;

        const query = options.getString("track_or_playlist_name_or_url", true);

        await interaction.deferReply({ flags: "Ephemeral" });

        const search = await music.search(query, {
            requestedBy: interaction.user,
        });

        if (search.isEmpty())
            return interaction.reply({
                content: bold("No results found"),
                flags: "Ephemeral",
            });

        const queue = music.queues.get<QueueMetadata>(guild);

        if (search.hasPlaylist() && search.playlist) {
            const { playlist } = search;

            const embed = new Embed()
                .setAuthor({
                    name: "Added a playlist to the queue",
                })
                .setDescription(
                    `**${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) [${playlist.tracks.length} Tracks]**`,
                )
                .setThumbnail(playlist.thumbnail)
                .setURL(playlist.url);

            if (queue && !queue.isEmpty()) {
                queue.addTrack(playlist.tracks);

                return music.showPlaylistTracks(
                    await interaction.editReply({
                        embeds: [embed],
                    }),
                    playlist,
                );
            }

            await music.play<QueueMetadata>(member.voice.channel, playlist, {
                nodeOptions: {
                    metadata: {
                        textChannel: interaction.channel,
                        voiceChannel: member.voice.channel,
                    },
                },
                requestedBy: interaction.user,
            });

            return music.showPlaylistTracks(
                await interaction.editReply({
                    embeds: [embed],
                }),
                playlist,
            );
        }

        if (queue && !queue.isEmpty()) {
            queue.addTrack(search.tracks[0]);
            return interaction.editReply({
                content: `**Added to the queue:** [${search.tracks[0].title}](${search.tracks[0].url})`,
            });
        }

        await music.play(member.voice.channel, search.tracks[0], {
            nodeOptions: {
                metadata: {
                    textChannel: interaction.channel,
                    voiceChannel: member.voice.channel,
                },
            },
            requestedBy: interaction.user,
        });

        await interaction.editReply({
            content: `**Now playing:** [${search.tracks[0].title}](${search.tracks[0].url})`,
        });
    }

    async slashPause(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        if (queue.node.isPaused())
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **The player is already paused**`,
                flags: "Ephemeral",
            });

        queue.node.pause();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Paused the player**`,
            flags: "Ephemeral",
        });
    }

    async slashResume(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        if (!queue.node.isPaused())
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **The player is not paused**`,
                flags: "Ephemeral",
            });

        queue.node.resume();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Resumed the player**`,
            flags: "Ephemeral",
        });
    }

    async slashSkip(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        if (
            queue.currentTrack &&
            queue.currentTrack.requestedBy &&
            queue.currentTrack.requestedBy.id !== member.id &&
            queue.metadata.voiceChannel.members.get(
                queue.currentTrack.requestedBy.id,
            )
        )
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                flags: "Ephemeral",
            });

        const { options } = interaction;

        const trackId = options.getString("track_in_queue");
        if (!trackId) {
            queue.node.skip();
            return interaction.reply({
                content: `${emojis.get("yes") ?? "✅"} **Skipped the current track**`,
                flags: "Ephemeral",
            });
        }

        const track = queue.tracks.find((t) => t.id === trackId);

        if (!track)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Track not found**`,
                flags: "Ephemeral",
            });

        queue.node.jump(track);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Skipped to [${track.title}](${track.url}) - ${track.author}**`,
            flags: "Ephemeral",
        });
    }

    async slashStop(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        queue.node.stop();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Stopped the player**`,
            flags: "Ephemeral",
        });
    }

    async slashQueue(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        return music.showQueue(interaction, queue);
    }

    async slashLoop(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
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
            flags: "Ephemeral",
        });
    }

    async slashShuffle(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        queue.tracks.shuffle();

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Shuffled the queue**`,
            flags: "Ephemeral",
        });
    }

    async slashSeek(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!queue.currentTrack)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **No track is currently playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        const { options } = interaction;

        const seekTimeStr = options.getString("seek_time", true);

        if (!durationPattern.test(seekTimeStr))
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Invalid duration format**`,
                flags: "Ephemeral",
            });

        const seekTime = durationToMs(seekTimeStr);

        if (seekTime < 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Seek time cannot be negative**`,
                flags: "Ephemeral",
            });

        if (seekTime > queue.currentTrack.durationMS)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Seek time cannot be greater than the track duration**`,
                flags: "Ephemeral",
            });

        await queue.node.seek(seekTime);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Seeked to ${seekTimeStr}**`,
            flags: "Ephemeral",
        });
    }

    async slashVolume(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        const { options } = interaction;

        const volume = options.getInteger("volume", true);

        queue.node.setVolume(volume);

        return interaction.reply({
            content: `${emojis.get("yes") ?? "✅"} **Volume set to ${volume}%**`,
            flags: "Ephemeral",
        });
    }

    async slashFiltersToggle(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        const { options } = interaction;

        const filter = options.getString("player_filters") as
            | keyof QueueFilters
            | null;

        if (filter) {
            await queue.filters.ffmpeg.toggle(filter);

            return interaction.reply({
                content: `${emojis.get("yes") ?? "✅"} **Toggled ${filter} filter ${
                    queue.filters.ffmpeg.isEnabled(filter) ? "on" : "off"
                }**`,
                flags: "Ephemeral",
            });
        }

        const {
            filters: { ffmpeg },
        } = queue;

        const filters = [
            ...ffmpeg.getFiltersDisabled(),
            ...ffmpeg.getFiltersEnabled(),
        ];

        if (filters.length === 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **No filters available**`,
                flags: "Ephemeral",
            });

        const filtersChunk = chunk(filters, 25);

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        for (let i = 0; i < filtersChunk.length; i++) {
            const filters = filtersChunk[i];
            const menu = new StringDropdown().setCustomId(`filters_${i}`);

            const opts = [];

            for (const filter of filters) {
                opts.push({
                    label: `${startCase(filter)} (${ffmpeg.isEnabled(filter) ? "On" : "Off"})`,
                    value: filter,
                });
            }

            menu.setOptions(opts);
            menus.push(new Row().setComponents(menu));
        }

        const navButtons = new Row().setComponents(
            new Button()
                .setCustomId("previous_page")
                .setEmoji(emojis.get("left_arrow")?.toString() ?? "⬅️"),

            new Button()
                .setCustomId("next_page")
                .setEmoji(emojis.get("right_arrow")?.toString() ?? "➡️"),
        );

        let page = 0;

        const iResponse = await interaction
            .reply({
                content: `**Select filters to toggle (${page + 1}/${filtersChunk.length})**`,
                components: [menus[page], navButtons],
                flags: "Ephemeral",
                withResponse: true,
            })
            .then((i) => i.resource?.message);
        if (!iResponse) return;

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page",
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? menus.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === menus.length - 1 ? 0 : page + 1;

            await i.update({
                components: [menus[page], navButtons],
            });
        });

        const filterCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.customId.startsWith("filters_"),
        });

        filterCollector.on("collect", async (i) => {
            const filters = i.values as unknown as (keyof QueueFilters)[];

            await queue.filters.ffmpeg.toggle(filters);

            await i.update({
                content: `${emojis.get("yes") ?? "✅"} **Toggled ${filters.join(
                    ", ",
                )} filter ${
                    filters.every((f) => queue.filters.ffmpeg.isEnabled(f))
                        ? "on"
                        : "off"
                }**`,
                components: [],
            });
        });
    }

    async slashLyricsCurrentTrack(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const {
            client: {
                kEmojis: emojis,
                systems: { music },
            },
            member,
            guild,
        } = interaction;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **Music is not playing**`,
                flags: "Ephemeral",
            });

        if (!queue.currentTrack)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} No track is currently playing`,
                flags: "Ephemeral",
            });

        if (!member.voice.channel)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in a voice channel to use this command**`,
                flags: "Ephemeral",
            });

        if (member.voice.channel.id !== guild.members.me?.voice.channelId)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **You have to be in the same voice channel as me to use this command**`,
                flags: "Ephemeral",
            });

        return music.showLyrics(interaction, queue.currentTrack);
    }

    async slashLyricsSearch(interaction: ChatInputCommandInteraction) {
        const {
            client: {
                systems: { music },
            },
            options,
        } = interaction;

        const query = options.getString("track_or_playlist_name_or_url", true);

        const result = await music.search(query);
        if (result.isEmpty())
            return interaction.reply({
                content: bold("No results found"),
                flags: "Ephemeral",
            });

        return music.showLyrics(interaction, result.tracks[0]);
    }
}
