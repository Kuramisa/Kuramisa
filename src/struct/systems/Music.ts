import { GuildQueue, Player, Playlist, Track } from "discord-player";
import { container } from "@sapphire/framework";
import {
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    InteractionResponse
} from "discord.js";
import { chunk, startCase } from "lodash";

export default class Music extends Player {
    constructor() {
        super(container.client);

        this.extractors
            .loadDefault((ext) => ext !== "YouTubeExtractor")
            .then(() => {
                container.logger.info(
                    "[Music] Loaded all extractors except YouTubeExtractor"
                );
            })
            .catch(container.logger.error);
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

        let page = 0;

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

        let navIR: InteractionResponse = interaction;

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
                `${this.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n**Duration** 0:00/${track.duration}`
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy?.globalName || track.requestedBy?.username}`,
                iconURL: track.requestedBy?.displayAvatarURL()
            })
            .setURL(track.url);
    }
}
