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
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    GuildVoiceChannelResolvable,
    InteractionResponse
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
        const { util } = container;

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
                const navButtons = util
                    .row()
                    .setComponents(
                        util
                            .button()
                            .setCustomId("previous_page")
                            .setEmoji("⬅️")
                            .setStyle(ButtonStyle.Secondary),
                        util
                            .button()
                            .setCustomId("next_page")
                            .setEmoji("➡️")
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
        let speakerEmoji = "🔇";
        if (volume <= 100 && volume >= 75) speakerEmoji = "🔊";
        else if (volume <= 75 && volume >= 25) speakerEmoji = "🔉";
        else if (volume <= 25 && volume > 0) speakerEmoji = "🔈";

        return speakerEmoji;
    }

    playerControls(paused = false) {
        const { util } = container;

        return [
            util.row().setComponents(
                util
                    .button()
                    .setCustomId("player_previous")
                    .setEmoji("⏮️")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("player_playpause")
                    .setEmoji(paused ? "▶️" : "⏸️")
                    .setStyle(
                        paused ? ButtonStyle.Success : ButtonStyle.Danger
                    ),
                util
                    .button()
                    .setCustomId("player_next")
                    .setEmoji("⏭️")
                    .setStyle(ButtonStyle.Secondary)
            ),
            util
                .row()
                .setComponents(
                    util
                        .button()
                        .setCustomId("player_shuffle")
                        .setEmoji("🔀")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("player_queue")
                        .setEmoji("📜")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("player_loop")
                        .setEmoji("🔁")
                        .setStyle(ButtonStyle.Secondary)
                ),
            util
                .row()
                .setComponents(
                    util
                        .button()
                        .setCustomId("player_volume_down")
                        .setEmoji("🔉")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("player_volume_mute")
                        .setEmoji("🔇")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("player_volume_up")
                        .setEmoji("🔊")
                        .setStyle(ButtonStyle.Secondary)
                )
        ];
    }

    nowPlayingEmbed(queue: GuildQueue, track: Track) {
        return container.util
            .embed()
            .setAuthor({ name: "Now Playing" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${this.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n\n${queue.node.createProgressBar()}`
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy?.globalName || track.requestedBy?.username}`,
                iconURL: track.requestedBy?.displayAvatarURL()
            })
            .setURL(track.url);
    }

    async showQueue(interaction: ButtonInteraction, queue: GuildQueue) {
        const { util } = container;

        const tracksChunk = chunk(queue.tracks.toArray(), 10);

        const embeds: EmbedBuilder[] = [];

        const trackNumber = 1;

        for (let i = 0; i < tracksChunk.length; i++) {
            const tracks = tracksChunk[i];
            const embed = util.embed().setAuthor({
                name: `${queue.guild.name} Music Queue - Page ${i + 1}`
            });

            const description = [];

            for (let j = 0; j < tracks.length; j++) {
                const track = tracks[j];

                description.push(
                    `**${trackNumber}.** [${track.title}](${track.url}) - ${track.author} [${track.duration}]`
                );
            }

            embed.setDescription(description.join("\n"));

            embeds.push(embed);
        }

        const navButtons = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("previous_page")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("next_page")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Secondary)
            );

        let page = 0;

        const iResponse = await interaction.reply({
            embeds: [embeds[page]],
            components: [navButtons],
            ephemeral: true
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

        const row = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("loop_track")
                    .setLabel("Track")
                    .setEmoji("🎵")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("loop_queue")
                    .setLabel("Queue")
                    .setEmoji("🎶")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("loop_none")
                    .setLabel("Off")
                    .setEmoji("✖️")
                    .setStyle(ButtonStyle.Danger)
            );

        const iResponse = await interaction.reply({
            content: "**Select loop mode**",
            components: [row],
            ephemeral: true
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

        await bInteraction.update({
            content: `Loop mode set to **${loopMode}**`
        });
    }
}
