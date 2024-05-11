import Kuramisa from "Kuramisa";

import {
    GuildQueue,
    Player,
    PlayerNodeInitializationResult,
    PlayerNodeInitializerOptions,
    Playlist,
    QueueRepeatMode,
    Track,
    TrackLike
} from "discord-player";

import {
    ActionRowBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildVoiceChannelResolvable,
    InteractionResponse,
    Message,
    MessageActionRowComponentBuilder
} from "discord.js";
import { chunk, startCase, truncate } from "lodash";
import {
    KButton,
    KEmbed,
    KRow,
    KStringSelectMenu,
    timedDelete,
    toEmoji
} from "@utils";

export default class Music extends Player {
    private readonly kuramisa: Kuramisa;

    constructor(kuramisa: Kuramisa) {
        super(kuramisa, {
            skipFFmpeg: false
        });

        this.kuramisa = kuramisa;

        const { logger } = kuramisa;

        this.extractors
            .loadDefault()
            .then(() => {
                logger.info("[Music] Loaded all extractors");
            })
            .catch(logger.error);
    }

    async play<T = unknown>(
        channel: GuildVoiceChannelResolvable,
        query: TrackLike,
        options?: PlayerNodeInitializerOptions<T>
    ): Promise<PlayerNodeInitializationResult<T>> {
        return super.play(channel, query, {
            ...options,
            nodeOptions: {
                volume: 50,
                selfDeaf: true,
                leaveOnEmpty: true,
                leaveOnEnd: false,
                ...options?.nodeOptions
            }
        });
    }

    async showLyrics(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        queue: GuildQueue
    ) {
        const { kEmojis, logger } = this.kuramisa;

        if (!queue.currentTrack)
            return interaction.reply({
                content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} No track is currently playing`,
                ephemeral: true
            });

        const { currentTrack: track } = queue;

        const results = await this.lyrics
            .search({
                trackName: track.title,
                artistName: track.author
            })
            .catch((e) => {
                logger.error(e);
                return null;
            });

        if (!results)
            return interaction.reply({
                content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} **No lyrics found**`,
                ephemeral: true
            });
    }

    async showPlaylistTracks(message: Message, playlist: Playlist) {
        const { kEmojis } = this.kuramisa;

        const tracksChunk = chunk(playlist.tracks, 20);

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("list_tracks")
                .setLabel("List tracks")
                .setStyle(ButtonStyle.Success)
        );

        await message.edit({
            components: [row]
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) => i.customId === "list_tracks"
        });

        const embeds: EmbedBuilder[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = new KEmbed().setAuthor({
                name: `${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) Tracks`
            });

            const description = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                description.push(
                    `**${trackNumber}.** [${track.title}](${track.url}) - ${track.author} [${track.duration}]`
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
                const navButtons = new KRow().setComponents(
                    new KButton()
                        .setCustomId("previous_page")
                        .setEmoji(kEmojis.get("left_arrow") ?? "⬅️")
                        .setStyle(ButtonStyle.Secondary),
                    new KButton()
                        .setCustomId("next_page")
                        .setEmoji(kEmojis.get("right_arrow") ?? "➡️")
                        .setStyle(ButtonStyle.Secondary)
                );

                navIR = await i.reply({
                    embeds: [embeds[page]],
                    components: [navButtons],
                    ephemeral: true
                });
            }
        });

        const navCollector = navIR.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (navI) =>
                navI.customId === "previous_page" ||
                navI.customId === "next_page",
            time: 0
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? embeds.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === embeds.length - 1 ? 0 : page + 1;

            await i.update({
                embeds: [embeds[page]]
            });
        });
    }

    volumeEmoji(volume: number) {
        const { kEmojis } = this.kuramisa;

        let speakerEmoji = kEmojis.get("player_muted") ?? "🔇";
        if (volume <= 100 && volume >= 80)
            speakerEmoji = kEmojis.get("player_high_volume") ?? "🔊";
        else if (volume <= 80 && volume >= 25)
            speakerEmoji = kEmojis.get("player_mid_volume") ?? "🔉";
        else if (volume <= 25 && volume > 0)
            speakerEmoji = kEmojis.get("player_low_volume") ?? "🔈";

        return speakerEmoji;
    }

    loopEmoji(loopMode: QueueRepeatMode) {
        const { kEmojis } = this.kuramisa;

        switch (loopMode) {
            case QueueRepeatMode.TRACK:
                return kEmojis.get("player_repeat_one") ?? "🔂";
            case QueueRepeatMode.QUEUE:
                return kEmojis.get("player_repeat") ?? "🔁";
            case QueueRepeatMode.OFF:
                return kEmojis.get("no") ?? "🚫";
            default:
                return kEmojis.get("player_repeat") ?? "🔁";
        }
    }

    playerControls(paused = false) {
        const { kEmojis } = this.kuramisa;

        return [
            new KRow().setComponents(
                new KButton()
                    .setCustomId("player_goback_to")
                    .setEmoji(kEmojis.get("player_rewind") ?? "⏮️")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_previous")
                    .setEmoji(kEmojis.get("player_previous") ?? "⏪")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_playpause")
                    .setEmoji(
                        paused
                            ? kEmojis.get("player_play") ?? "▶️"
                            : kEmojis.get("player_pause") ?? "⏸️"
                    )
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_next")
                    .setEmoji(kEmojis.get("player_skip") ?? "⏩")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_skip_to")
                    .setEmoji(kEmojis.get("player_skip_to") ?? "⏭️")
                    .setStyle(ButtonStyle.Secondary)
            ),
            new KRow().setComponents(
                new KButton()
                    .setCustomId("player_shuffle")
                    //.setLabel("Shuffle")
                    .setEmoji(kEmojis.get("player_shuffle") ?? "🔀")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_queue")
                    //.setLabel("Queue")
                    .setEmoji(kEmojis.get("playlist") ?? "📜")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_progress")
                    //.setLabel("Progress")
                    .setEmoji(kEmojis.get("time") ?? "🕰️")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_loop")
                    //.setLabel("Loop")
                    .setEmoji(kEmojis.get("player_repeat") ?? "🔁")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_lyrics")
                    .setEmoji(kEmojis.get("genius") ?? "📝")
                    .setStyle(ButtonStyle.Secondary)
            ),
            new KRow().setComponents(
                new KButton()
                    .setCustomId("player_volume_down")
                    .setEmoji(kEmojis.get("player_low_volume") ?? "🔉")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_volume_mute")
                    .setEmoji(kEmojis.get("player_muted") ?? "🔇")
                    .setStyle(ButtonStyle.Secondary),
                new KButton()
                    .setCustomId("player_volume_up")
                    .setEmoji(kEmojis.get("player_high_volume") ?? "🔊")
                    .setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    async nowPlayingEmbed(queue: GuildQueue, track?: Track) {
        const embed = new KEmbed()
            .setAuthor({
                name: "Now Playing"
            })
            .setDescription(
                `${await toEmoji(this.volumeEmoji(queue.node.volume))} **Volume** ${queue.node.volume}%\n${await toEmoji(this.loopEmoji(queue.repeatMode))} **Loop Mode:** ${
                    queue.repeatMode === QueueRepeatMode.TRACK
                        ? "Track"
                        : queue.repeatMode === QueueRepeatMode.QUEUE
                          ? "Queue"
                          : "Off"
                }`
            );

        if (track) {
            embed
                .setTitle(`${track.title} - ${track.author}`)

                .setThumbnail(track.thumbnail)
                .setFooter({
                    text: `Requested by ${track.requestedBy?.globalName ?? track.requestedBy?.username}`,
                    iconURL: track.requestedBy?.displayAvatarURL()
                })
                .setURL(track.url);
        } else if (queue.currentTrack) {
            track = queue.currentTrack;

            embed
                .setTitle(`${track.title} - ${track.author}`)

                .setThumbnail(track.thumbnail)
                .setFooter({
                    text: `Requested by ${track.requestedBy?.globalName || track.requestedBy?.username}`,
                    iconURL: track.requestedBy?.displayAvatarURL()
                })
                .setURL(track.url);
        }

        return embed;
    }

    async showQueue(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        queue: GuildQueue
    ) {
        const { kEmojis } = this.kuramisa;

        const tracksChunk = chunk(queue.tracks.toArray(), 10);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} The queue is empty`,
                ephemeral: true
            });

        const embeds: EmbedBuilder[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = new KEmbed().setAuthor({
                name: `${queue.guild.name} Music Queue - Page ${i + 1} / ${tracksChunk.length} [${queue.tracks.size} tracks]`
            });

            const description = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                description.push(
                    `**${trackNumber}.** [${track.title}](${track.url}) - ${track.author} [${track.duration}]`
                );

                trackNumber++;
            }

            embed.setDescription(description.join("\n"));

            embeds.push(embed);
        }

        const navButtons = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow") ?? "➡️")
                .setStyle(ButtonStyle.Secondary)
        );

        let page = 0;

        const iResponse = await interaction.reply({
            embeds: [embeds[page]],
            components: [navButtons],
            ephemeral: true,
            fetchReply: true
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page"
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? embeds.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === embeds.length - 1 ? 0 : page + 1;

            await i.update({
                embeds: [embeds[page]]
            });
        });
    }

    async askForLoopMode(interaction: ButtonInteraction, queue: GuildQueue) {
        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("loop_track")
                .setLabel("Track")
                .setEmoji(this.loopEmoji(QueueRepeatMode.TRACK) ?? "🎵")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("loop_queue")
                .setLabel("Queue")
                .setEmoji(this.loopEmoji(QueueRepeatMode.QUEUE) ?? "🎶")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("loop_none")
                .setLabel("Off")
                .setEmoji(this.loopEmoji(QueueRepeatMode.OFF ?? "🚫"))
                .setStyle(ButtonStyle.Danger)
        );

        const iResponse = await interaction.reply({
            content: "**Select loop mode**",
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        const bInteraction = await iResponse.awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "loop_queue" ||
                i.customId === "loop_track" ||
                i.customId === "loop_none"
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
                content: `${await toEmoji(this.loopEmoji(queue.repeatMode))} Loop mode set to **${loopMode}**`,
                components: []
            })
            .then((i) => timedDelete(i, 4000));

        const { guild } = queue;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content: "",
                embeds: [await this.nowPlayingEmbed(queue)],
                components: this.playerControls(queue.node.isPaused())
            });
        }
    }

    async askForSkipTo(interaction: ButtonInteraction, queue: GuildQueue) {
        const { kEmojis } = this.kuramisa;

        const tracksChunk = chunk(queue.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} The queue is empty`,
                ephemeral: true
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = new KStringSelectMenu().setCustomId(`skip_to_${i}`);

            const opts = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                opts.push({
                    label: `${trackNumber}. ${truncate(track.title, { length: 50 })} - ${track.author}`,
                    value: track.id
                });

                trackNumber++;
            }

            menu.addOptions(opts);
            menus.push(new KRow().setComponents(menu));
        }

        const navButtons = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow") ?? "➡️")
                .setStyle(ButtonStyle.Secondary)
        );

        let page = 0;

        const iResponse = await interaction.reply({
            content: `**Select a track to skip to (${page + 1}/${tracksChunk.length})**`,
            components: [menus[page], navButtons],
            ephemeral: true,
            fetchReply: true
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page"
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? menus.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === menus.length - 1 ? 0 : page + 1;

            await i.update({
                components: [menus[page], navButtons]
            });
        });

        const trackCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 0,
            filter: (i) => i.customId.startsWith("skip_to_")
        });

        trackCollector.on("collect", async (i) => {
            const trackId = i.values[0];
            const track = queue.tracks.find((t) => t.id === trackId);

            if (!track)
                return interaction
                    .reply({
                        content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} Track not found`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i, 4000));

            await i.update({
                content: `${await toEmoji(kEmojis.get("player_skip_to") ?? "⏩")} Skipped to **${track.title} - ${track.author}**`,
                components: []
            });

            queue.node.jump(track);
        });
    }

    async askForGoBackTo(interaction: ButtonInteraction, queue: GuildQueue) {
        const { kEmojis } = this.kuramisa;

        const tracksChunk = chunk(queue.history.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} Nothing to go back to`,
                ephemeral: true
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = queue.history.tracks.size;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = new KStringSelectMenu().setCustomId(`go_back_to_${i}`);

            const opts = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                opts.push({
                    label: `${trackNumber}. ${track.title} - ${track.author}`,
                    value: track.id
                });

                trackNumber--;
            }

            menu.addOptions(opts);
            menus.push(new KRow().setComponents(menu));
        }

        const navButtons = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow") ?? "➡️")
                .setStyle(ButtonStyle.Secondary)
        );

        let page = 0;

        const iResponse = await interaction.reply({
            content: `**Select a track to skip to (${page + 1}/${tracksChunk.length})**`,
            components: [menus[page], navButtons],
            ephemeral: true,
            fetchReply: true
        });

        const navCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page"
        });

        navCollector.on("collect", async (i) => {
            if (i.customId === "previous_page")
                page = page === 0 ? menus.length - 1 : page - 1;
            else if (i.customId === "next_page")
                page = page === menus.length - 1 ? 0 : page + 1;

            await i.update({
                components: [menus[page], navButtons]
            });
        });

        const trackCollector = iResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 0,
            filter: (i) => i.customId.startsWith("go_back_to")
        });

        trackCollector.on("collect", async (i) => {
            const trackId = i.values[0];
            const track = queue.history.tracks.find((t) => t.id === trackId);

            if (!track)
                return interaction
                    .reply({
                        content: `${await toEmoji(kEmojis.get("no") ?? "🚫")} Track not found`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i, 4000));

            await i.update({
                content: `${await toEmoji(kEmojis.get("player_rewind") ?? "⏪")} Went back to **${track.title} - ${track.author}**`,
                components: []
            });

            queue.node.jump(track);
        });
    }
}
