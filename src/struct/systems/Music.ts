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
import { container } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    GuildVoiceChannelResolvable,
    InteractionResponse,
    MessageActionRowComponentBuilder
} from "discord.js";
import { chunk, startCase } from "lodash";

export default class Music extends Player {
    constructor() {
        super(container.client, {
            skipFFmpeg: false
        });

        this.extractors
            .loadDefault()
            .then(() => {
                container.logger.info("[Music] Loaded all extractors");
            })
            .catch(container.logger.error);
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

    async showPlaylistTracks(
        interaction: InteractionResponse,
        playlist: Playlist
    ) {
        const { emojis, util } = container;

        const tracksChunk = chunk(playlist.tracks, 20);

        const row = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("list_tracks")
                    .setLabel("List tracks")
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.edit({
            components: [row]
        });

        const collector = interaction.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) => i.customId === "list_tracks"
        });

        const embeds: EmbedBuilder[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = util.embed().setAuthor({
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

        let navIR = interaction;

        collector.on("collect", async (i) => {
            if (i.customId === "list_tracks") {
                const navButtons = util.row().setComponents(
                    util
                        .button()
                        .setCustomId("previous_page")
                        .setEmoji(emojis.get("left_arrow") ?? "⬅️")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("next_page")
                        .setEmoji(emojis.get("right_arrow") ?? "➡️")
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
        const { emojis } = container;

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
        const { emojis } = container;

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
        const { emojis, util } = container;

        return [
            util.row().setComponents(
                util
                    .button()
                    .setCustomId("player_goback_to")
                    .setEmoji(emojis.get("player_rewind") ?? "⏮️")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_previous")
                    .setEmoji(emojis.get("player_previous") ?? "⏪")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_playpause")
                    .setEmoji(
                        paused
                            ? emojis.get("player_play") ?? "▶️"
                            : emojis.get("player_pause") ?? "⏸️"
                    )
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_next")
                    .setEmoji(emojis.get("player_skip") ?? "⏩")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_skip_to")
                    .setEmoji(emojis.get("player_skip_to") ?? "⏭️")
                    .setStyle(ButtonStyle.Secondary)
            ),
            util.row().setComponents(
                util
                    .button()
                    .setCustomId("player_shuffle")
                    .setLabel("Shuffle")
                    .setEmoji(emojis.get("player_shuffle") ?? "🔀")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_queue")
                    .setLabel("Queue")
                    .setEmoji(emojis.get("playlist") ?? "📜")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_progress")
                    .setLabel("Progress")
                    .setEmoji(emojis.get("time") ?? "🕰️")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_loop")
                    .setLabel("Loop")
                    .setEmoji(emojis.get("player_repeat") ?? "🔁")
                    .setStyle(ButtonStyle.Secondary)
            ),
            util.row().setComponents(
                util
                    .button()
                    .setCustomId("player_volume_down")
                    .setEmoji(emojis.get("player_low_volume") ?? "🔉")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_volume_mute")
                    .setEmoji(emojis.get("player_muted") ?? "🔇")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_volume_up")
                    .setEmoji(emojis.get("player_high_volume") ?? "🔊")
                    .setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    async nowPlayingEmbed(queue: GuildQueue, track?: Track) {
        const { util } = container;

        const embed = container.util
            .embed()
            .setAuthor({
                name: "Now Playing"
            })
            .setDescription(
                `${await util.toEmoji(this.volumeEmoji(queue.node.volume))} **Volume** ${queue.node.volume}%\n${await util.toEmoji(this.loopEmoji(queue.repeatMode))} **Loop Mode:** ${
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

    async showQueue(interaction: ButtonInteraction, queue: GuildQueue) {
        const { emojis, util } = container;

        const tracksChunk = chunk(queue.tracks.toArray(), 10);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} The queue is empty`,
                ephemeral: true
            });

        const embeds: EmbedBuilder[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = util.embed().setAuthor({
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

        const navButtons = util.row().setComponents(
            util
                .button()
                .setCustomId("previous_page")
                .setEmoji(emojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("next_page")
                .setEmoji(emojis.get("right_arrow") ?? "➡️")
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
        const { util } = container;

        const row = util.row().setComponents(
            util
                .button()
                .setCustomId("loop_track")
                .setLabel("Track")
                .setEmoji(this.loopEmoji(QueueRepeatMode.TRACK) ?? "🎵")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("loop_queue")
                .setLabel("Queue")
                .setEmoji(this.loopEmoji(QueueRepeatMode.QUEUE) ?? "🎶")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
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
                content: `${await util.toEmoji(this.loopEmoji(queue.repeatMode))} Loop mode set to **${loopMode}**`,
                components: []
            })
            .then((i) => container.util.timedDelete(i, 4000));

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
        const { emojis, util } = container;

        const tracksChunk = chunk(queue.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} The queue is empty`,
                ephemeral: true
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = util.stringMenu().setCustomId(`skip_to_${i}`);

            const opts = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                opts.push({
                    label: `${trackNumber}. ${util.shorten(track.title, 50)} - ${track.author}`,
                    value: track.id
                });

                trackNumber++;
            }

            menu.addOptions(opts);
            menus.push(util.row().setComponents(menu));
        }

        const navButtons = util.row().setComponents(
            util
                .button()
                .setCustomId("previous_page")
                .setEmoji(emojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("next_page")
                .setEmoji(emojis.get("right_arrow") ?? "➡️")
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
                        content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} Track not found`,
                        ephemeral: true
                    })
                    .then((i) => util.timedDelete(i, 4000));

            await i.update({
                content: `${await util.toEmoji(emojis.get("player_skip_to") ?? "⏩")} Skipped to **${track.title} - ${track.author}**`,
                components: []
            });

            queue.node.jump(track);
        });
    }

    async askForGoBackTo(interaction: ButtonInteraction, queue: GuildQueue) {
        const { emojis, util } = container;

        const tracksChunk = chunk(queue.history.tracks.toArray(), 25);

        if (tracksChunk.length === 0)
            return interaction.reply({
                content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} Nothing to go back to`,
                ephemeral: true
            });

        const menus: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        let trackNumber = queue.history.tracks.size;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const menu = util.stringMenu().setCustomId(`go_back_to_${i}`);

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
            menus.push(util.row().setComponents(menu));
        }

        const navButtons = util.row().setComponents(
            util
                .button()
                .setCustomId("previous_page")
                .setEmoji(emojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("next_page")
                .setEmoji(emojis.get("right_arrow") ?? "➡️")
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
                        content: `${await util.toEmoji(emojis.get("no") ?? "🚫")} Track not found`,
                        ephemeral: true
                    })
                    .then((i) => util.timedDelete(i, 4000));

            await i.update({
                content: `${await util.toEmoji(emojis.get("player_rewind") ?? "⏪")} Went back to **${track.title} - ${track.author}**`,
                components: []
            });

            queue.node.jump(track);
        });
    }
}
