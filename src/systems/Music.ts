import { DefaultExtractors } from "@discord-player/extractor";
import { Button, Embed, Row, StringDropdown } from "Builders";
import type { GuildQueue, Playlist, Track } from "discord-player";
import {
    Player,
    type PlayerNodeInitializationResult,
    type PlayerNodeInitializerOptions,
    QueueRepeatMode,
    type TrackLike,
} from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import type { ActionRowBuilder, InteractionResponse } from "discord.js";
import {
    type ButtonInteraction,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    type GuildVoiceChannelResolvable,
    type Message,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import type Kuramisa from "Kuramisa";
import chunk from "lodash/chunk";
import startCase from "lodash/startCase";
import truncate from "lodash/truncate";
import logger from "Logger";
import ms from "ms";
import type { QueueMetadata } from "typings/Music";
import { Pagination, timedDelete } from "utils";

export default class Music extends Player {
    constructor(client: Kuramisa) {
        super(client, {
            skipFFmpeg: false,
        });
    }

    async init() {
        const startTime = Date.now();

        await this.extractors
            .loadMulti(DefaultExtractors)
            .then(() => logger.debug("[Music] Default Extractors loaded"))
            .catch((error) =>
                logger.error("[Music] Error loading extractors", error),
            );

        await this.extractors
            .register(YoutubeiExtractor, {})
            .then(() => logger.debug("[Music] YoutubeiExtractor loaded"))
            .catch((error) =>
                logger.error("[Music] Error loading YoutubeiExtractor", error),
            );

        logger.debug(`[Music] Loaded ${this.extractors.size} extractors`);

        logger.debug(this.scanDeps());

        logger.info(`[Music] Initialized in ${ms(Date.now() - startTime)}`);
    }

    async play<T = unknown>(
        channel: GuildVoiceChannelResolvable,
        query: TrackLike,
        options?: PlayerNodeInitializerOptions<T>,
    ): Promise<PlayerNodeInitializationResult<T>> {
        return super.play(channel, query, {
            ...options,
            nodeOptions: {
                volume: 50,
                selfDeaf: true,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 60000,
                leaveOnEnd: false,
                ...options?.nodeOptions,
            },
        });
    }

    async showLyrics(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        _track: string | Track,
    ) {
        const { kEmojis: emojis } = this.client;

        let track: Track<unknown> | null = null;

        if (typeof _track === "string")
            track = await this.search(_track).then((x) => x.tracks[0]);
        else track = _track;

        if (!track)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **No track found**`,
                flags: "Ephemeral",
            });

        const results = await this.lyrics.search({
            trackName: track.title,
            artistName: track.author,
        });

        if (!results.length)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} **No lyrics found**`,
                flags: "Ephemeral",
            });

        await interaction.deferReply();

        const { plainLyrics: lyrics } = results[0];

        const chunked = chunk(lyrics.split("\n"), 15);

        const embeds = chunked.map((chunk, index) =>
            new Embed()
                .setAuthor({
                    name: `${track.title} Lyrics`,
                })
                .setThumbnail(track.thumbnail)
                .setDescription(chunk.join("\n"))
                .setFooter({
                    text: `Page ${index + 1} / ${chunked.length}`,
                }),
        );

        Pagination.embeds(interaction, embeds);
    }

    async showPlaylistTracks(message: Message, playlist: Playlist) {
        const { kEmojis: emojis } = this.client;

        const tracksChunk = chunk(playlist.tracks, 20);

        const row = new Row().setComponents(
            new Button()
                .setCustomId("list_tracks")
                .setLabel("List Tracks")
                .setStyle(ButtonStyle.Success),
        );

        await message.edit({
            components: [row],
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) => i.customId === "list_tracks",
        });

        const embeds: Embed[] = [];

        let trackNumber = 1;

        for (const tracks of tracksChunk) {
            const embed = new Embed().setAuthor({
                name: `${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) Tracks`,
            });

            const description = [];

            for (const track of tracks) {
                description.push(
                    `**${trackNumber}.** [${track.title}](${track.url}) - ${track.author} [${track.duration}]`,
                );

                trackNumber++;
            }

            embed.setDescription(description.join("\n"));

            embeds.push(embed);
        }

        let page = 0;

        let navIR: Message | InteractionResponse = message;

        collector.on("collect", async (i) => {
            if (i.customId === "list_tracks") {
                const navButtons = new Row().setComponents(
                    new Button()
                        .setCustomId("previous_page")
                        .setEmoji(emojis.get("left_arrow")?.toString() ?? "⬅️"),

                    new Button()
                        .setCustomId("next_page")
                        .setEmoji(
                            emojis.get("right_arrow")?.toString() ?? "➡️",
                        ),
                );

                navIR = await i.reply({
                    embeds: [embeds[page]],
                    components: [navButtons],
                    flags: "Ephemeral",
                });
            }
        });

        const navCollector = navIR.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (navI) =>
                navI.customId === "previous_page" ||
                navI.customId === "next_page",
            time: 0,
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? embeds.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === embeds.length - 1 ? 0 : page + 1;

            await i.update({
                embeds: [embeds[page]],
            });
        });
    }

    volumeEmoji(volume: number) {
        const { kEmojis: emojis } = this.client;

        let speakerEmoji = emojis.get("player_muted") ?? "🔇";
        if (volume <= 100 && volume >= 80)
            speakerEmoji = emojis.get("player_high_volume") ?? "🔊";
        else if (volume <= 80 && volume >= 25)
            speakerEmoji = emojis.get("player_mid_volume") ?? "🔉";
        else if (volume <= 25 && volume > 0)
            speakerEmoji = emojis.get("player_low_volume") ?? "🔈";

        return speakerEmoji;
    }

    loopEmoji(loopMode: QueueRepeatMode) {
        const { kEmojis: emojis } = this.client;

        switch (loopMode) {
            case QueueRepeatMode.TRACK:
                return emojis.get("player_repeat_one") ?? "🔂";
            case QueueRepeatMode.QUEUE:
                return emojis.get("player_repeat") ?? "🔁";
            case QueueRepeatMode.OFF:
                return emojis.get("no") ?? "🚫";
            default:
                return emojis.get("player_repeat") ?? "🔁";
        }
    }

    playerControls(paused = false) {
        const { kEmojis: emojis } = this.client;

        return [
            new Row().setComponents(
                new Button()
                    .setCustomId("player_goback_to")
                    .setEmoji(emojis.get("player_rewind")?.toString() ?? "⏮️"),
                new Button()
                    .setCustomId("player_previous")
                    .setEmoji(
                        emojis.get("player_previous")?.toString() ?? "⏪",
                    ),
                new Button()
                    .setCustomId("player_playpause")
                    .setEmoji(
                        paused
                            ? (emojis.get("player_play")?.toString() ?? "▶️")
                            : (emojis.get("player_pause")?.toString() ?? "⏸️"),
                    ),
                new Button()
                    .setCustomId("player_next")
                    .setEmoji(emojis.get("player_skip")?.toString() ?? "⏩"),
                new Button()
                    .setCustomId("player_skip_to")
                    .setEmoji(emojis.get("player_skip_to")?.toString() ?? "⏭️"),
            ),
            new Row().setComponents(
                new Button()
                    .setCustomId("player_shuffle")
                    //.setLabel("Shuffle")
                    .setEmoji(emojis.get("player_shuffle")?.toString() ?? "🔀"),

                new Button()
                    .setCustomId("player_queue")
                    //.setLabel("Queue")
                    .setEmoji(emojis.get("playlist")?.toString() ?? "📜"),

                new Button()
                    .setCustomId("player_stop")
                    //.setLabel("Progress")
                    .setEmoji(emojis.get("player_stop")?.toString() ?? "⏹️"),

                new Button()
                    .setCustomId("player_loop")
                    //.setLabel("Loop")
                    .setEmoji(emojis.get("player_repeat")?.toString() ?? "🔁"),

                new Button()
                    .setCustomId("player_lyrics")
                    .setEmoji(emojis.get("genius")?.toString() ?? "📝"),
            ),
            new Row().setComponents(
                new Button()
                    .setCustomId("player_volume_down")
                    .setEmoji(
                        emojis.get("player_low_volume")?.toString() ?? "🔉",
                    ),

                new Button()
                    .setCustomId("player_volume_mute")
                    .setEmoji(emojis.get("player_muted")?.toString() ?? "🔇"),

                new Button()
                    .setCustomId("player_volume_up")
                    .setEmoji(
                        emojis.get("player_high_volume")?.toString() ?? "🔊",
                    ),

                new Button()
                    .setCustomId("player_progress")
                    //.setLabel("Progress")
                    .setEmoji(emojis.get("time")?.toString() ?? "🕰️"),
            ),
        ];
    }

    async nowPlayingEmbed(queue: GuildQueue<QueueMetadata>, track?: Track) {
        const embed = new Embed()
            .setAuthor({
                name: "Now Playing",
            })
            .setDescription(
                `${this.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n${this.loopEmoji(queue.repeatMode)} **Loop Mode:** ${
                    queue.repeatMode === QueueRepeatMode.TRACK
                        ? "Track"
                        : queue.repeatMode === QueueRepeatMode.QUEUE
                          ? "Queue"
                          : "Off"
                }`,
            );

        if (track) {
            embed
                .setTitle(`${track.title} - ${track.author}`)

                .setThumbnail(track.thumbnail)
                .setFooter({
                    text: `Requested by ${track.requestedBy?.displayName}`,
                    iconURL: track.requestedBy?.displayAvatarURL(),
                })
                .setURL(track.url);
        } else if (queue.currentTrack) {
            track = queue.currentTrack;

            embed
                .setTitle(`${track.title} - ${track.author}`)

                .setThumbnail(track.thumbnail)
                .setFooter({
                    text: `Requested by ${track.requestedBy?.displayName}`,
                    iconURL: track.requestedBy?.displayAvatarURL(),
                })
                .setURL(track.url);
        }

        return embed;
    }

    async showQueue(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        queue: GuildQueue<QueueMetadata>,
    ) {
        const { kEmojis: emojis } = this.client;

        const tracksChunk = chunk(queue.tracks.toArray(), 10);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} The queue is empty`,
                flags: "Ephemeral",
            });

        const embeds: Embed[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = new Embed().setAuthor({
                name: `${queue.guild.name} Music Queue - Page ${i + 1} / ${tracksChunk.length} [${queue.tracks.size} tracks]`,
            });

            const description = [];

            for (const track of tracks) {
                description.push(
                    `**${trackNumber}.** [${track.title}](${track.url}) - ${track.author} [${track.duration}]`,
                );

                trackNumber++;
            }

            embed.setDescription(description.join("\n"));

            embeds.push(embed);
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

        const iResponse = await interaction.reply({
            embeds: [embeds[page]],
            components: [navButtons],
            flags: "Ephemeral",
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page",
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? embeds.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === embeds.length - 1 ? 0 : page + 1;

            await i.update({
                embeds: [embeds[page]],
            });
        });
    }

    async askForLoopMode(
        interaction: ButtonInteraction,
        queue: GuildQueue<QueueMetadata>,
    ) {
        const row = new Row().setComponents(
            new Button()
                .setCustomId("loop_track")
                .setLabel("Track")
                .setEmoji(
                    this.loopEmoji(QueueRepeatMode.TRACK)?.toString() ?? "🎵",
                ),

            new Button()
                .setCustomId("loop_queue")
                .setLabel("Queue")
                .setEmoji(
                    this.loopEmoji(QueueRepeatMode.QUEUE)?.toString() ?? "🎶",
                ),

            new Button()
                .setCustomId("loop_none")
                .setLabel("Off")
                .setEmoji(
                    this.loopEmoji(QueueRepeatMode.OFF)?.toString() ?? "🚫",
                )
                .setStyle(ButtonStyle.Danger),
        );

        const iResponse = (
            await interaction.reply({
                content: "**Select loop mode**",
                components: [row],
                flags: "Ephemeral",
                withResponse: true,
            })
        ).resource?.message;

        if (!iResponse) return;

        const bInteraction = await iResponse.awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "loop_queue" ||
                i.customId === "loop_track" ||
                i.customId === "loop_none",
        });

        let loopMode = "";

        switch (bInteraction.customId) {
            case "loop_queue":
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                loopMode = "Queue";
                break;
            case "loop_track":
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                loopMode = "Track";
                break;
            case "loop_none":
                queue.setRepeatMode(QueueRepeatMode.OFF);
                loopMode = "None";
                break;
        }

        await bInteraction
            .update({
                content: `${this.loopEmoji(queue.repeatMode)} Loop mode set to **${loopMode}**`,
                components: [],
            })
            .then((i) => timedDelete(i, 4000));

        const { guild } = queue;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content: "",
                embeds: [await this.nowPlayingEmbed(queue)],
                components: this.playerControls(queue.node.isPaused()),
            });
        }
    }

    async askForSkipTo(
        interaction: ButtonInteraction,
        queue: GuildQueue<QueueMetadata>,
    ) {
        const { kEmojis: emojis } = this.client;

        const tracksChunk = chunk(queue.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} The queue is empty`,
                flags: "Ephemeral",
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = new StringDropdown().setCustomId(`skip_to_${i}`);

            const opts = [];

            for (const track of tracks) {
                opts.push({
                    label: `${trackNumber}. ${truncate(track.title, { length: 50 })} - ${track.author}`,
                    value: track.id,
                });

                trackNumber++;
            }

            menu.addOptions(opts);
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

        const iResponse = await interaction.reply({
            content: `**Select a track to skip to (${page + 1}/${tracksChunk.length})**`,
            components: [menus[page], navButtons],
            flags: "Ephemeral",
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
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

        const trackCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 0,
            filter: (i) => i.customId.startsWith("skip_to_"),
        });

        trackCollector.on("collect", async (i) => {
            const trackId = i.values[0];
            const track = queue.tracks.find((t) => t.id === trackId);

            if (!track)
                return interaction
                    .reply({
                        content: `${emojis.get("no") ?? "🚫"} Track not found`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i, 4000));

            await i.update({
                content: `${emojis.get("player_skip_to") ?? "⏩"} Skipped to **${track.title} - ${track.author}**`,
                components: [],
            });

            queue.node.jump(track);
        });
    }

    async askForGoBackTo(
        interaction: ButtonInteraction,
        queue: GuildQueue<QueueMetadata>,
    ) {
        const { kEmojis: emojis } = this.client;

        const tracksChunk = chunk(queue.history.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} Nothing to go back to`,
                flags: "Ephemeral",
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = queue.history.tracks.size;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = new StringDropdown().setCustomId(`go_back_to_${i}`);

            const opts = [];

            for (const track of tracks) {
                opts.push({
                    label: `${trackNumber}. ${track.title} - ${track.author}`,
                    value: track.id,
                });

                trackNumber--;
            }

            menu.addOptions(opts);
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

        const iResponse = await interaction.reply({
            content: `**Select a track to skip to (${page + 1}/${tracksChunk.length})**`,
            components: [menus[page], navButtons],
            flags: "Ephemeral",
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
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

        const trackCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 0,
            filter: (i) => i.customId.startsWith("go_back_to"),
        });

        trackCollector.on("collect", async (i) => {
            const trackId = i.values[0];
            const track = queue.history.tracks.find((t) => t.id === trackId);

            if (!track)
                return interaction
                    .reply({
                        content: `${emojis.get("no") ?? "🚫"} Track not found`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i, 4000));

            await i.update({
                content: `${emojis.get("player_rewind") ?? "⏪"} Went back to **${track.title} - ${track.author}**`,
                components: [],
            });

            queue.node.jump(track);
        });
    }
}
