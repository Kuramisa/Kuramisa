import { Subcommand } from "@sapphire/plugin-subcommands";
import { GuildQueue, useMainPlayer, useQueue } from "discord-player";
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

        if (query === "no_youtube")
            return interaction.reply({
                content:
                    "**We do not support YouTube, because of their TOS. We are sorry.**",
                ephemeral: true
            });

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
                    await interaction.reply({
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
                }
            });

            return interaction.reply({
                content: `Now playing: [${search.playlist.title}](${search.playlist.url})`,
                ephemeral: true
            });
        }

        if (queue && !queue.isEmpty()) {
            queue.addTrack(search.tracks);
            return interaction.reply({ content: "Added to queue" });
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

        return interaction.reply({
            content: `Now playing: [${search.tracks[0].title}](${search.tracks[0].url})`,
            ephemeral: true
        });
    }
}
