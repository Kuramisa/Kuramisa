import { Listener } from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";
import { Track } from "discord-player";

export class MusicAutocomplete extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Music Autocomplete",
            event: "interactionCreate",
        });
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete() || !interaction.inCachedGuild())
            return;
        const { commandName } = interaction;
        if (commandName !== "music") return;

        const { options } = interaction;

        const focused = options.getFocused(true);

        const {
            systems: { music },
            util,
        } = this.container;

        switch (focused.name) {
            case "song_or_playlist_or_url": {
                if (focused.value.length < 1) return;
                // eslint-disable-next-line prefer-const
                let { tracks, playlist } = await music.search(focused.value, {
                    requestedBy: interaction.user,
                });

                if (tracks.length < 1) return;

                tracks = tracks.filter(
                    (track: Track) => track.url.length < 100
                );

                if (playlist) {
                    const {
                        author: { name: author },
                        title,
                        description,
                        url,
                        source,
                    } = playlist;

                    return interaction.respond([
                        {
                            name: `${title} ${description === title ? "" : `- ${description}`
                                } by ${author} on ${_.capitalize(source)}`,
                            value: url,
                        },
                    ]);
                }

                return interaction.respond(
                    tracks.map((track: Track) => ({
                        name: util.shorten(
                            `${track.title} - ${track.author}`,
                            99
                        ),
                        value: track.url,
                    }))
                );
            }
            case "song_to_skip_to": {
                const queue = music.queues.get(interaction.guildId);
                if (!queue) return;
                let tracks = queue.tracks
                    .filter(
                        (track: Track) => track.id !== queue.currentTrack?.id
                    )
                    .map((track: Track) => ({
                        name: util.shorten(
                            `${track.title} - ${track.author}`,
                            99
                        ),
                        value: track.url,
                    }));

                if (tracks.length < 1) return;
                if (focused.value.length > 0)
                    tracks = tracks.filter((track: any) =>
                        track.name
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (tracks.length > 25) tracks = tracks.slice(0, 25);

                return interaction.respond(tracks);
            }
        }
    }
}
