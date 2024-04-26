import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";

import { useMainPlayer, useQueue } from "discord-player";
import { startCase, truncate } from "lodash";

export class MusicACHandler extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        opts: InteractionHandler.Options
    ) {
        super(ctx, {
            ...opts,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    override async run(
        interaction: AutocompleteInteraction,
        result: InteractionHandler.ParseResult<this>
    ) {
        return interaction.respond(result);
    }

    override async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "music") return this.none();

        const { options } = interaction;

        const focused = options.getFocused(true);

        const player = useMainPlayer();

        if (focused.name === "track_or_playlist_url") {
            if (focused.value.length < 1)
                return this.some([
                    {
                        name: "Random Song",
                        value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    }
                ]);

            const search = await player.search(focused.value, {
                requestedBy: interaction.user
            });

            if (search.isEmpty()) return this.none();

            if (search.hasPlaylist() && search.playlist) {
                const { playlist } = search;

                return this.some([
                    {
                        name: `${startCase(playlist.source)} ${startCase(playlist.type)} - ${truncate(playlist.title, { length: 20 })} (${playlist.author.name}) [${playlist.tracks.length} Tracks]`,
                        value: playlist.url
                    }
                ]);
            }

            const { tracks } = search;

            return this.some(
                tracks.map((track) => ({
                    name: `${truncate(track.title, { length: 10 })} (${track.author})`,
                    value: track.url
                }))
            );
        } else if (focused.name === "track_in_queue") {
            if (!interaction.guildId) return this.none();

            const queue = useQueue(interaction.guildId);
            if (!queue) return this.none();

            let tracks = queue.tracks.toArray();
            if (tracks.length < 1) return this.none();
            if (focused.value.length < 1) tracks = tracks.slice(0, 25);

            if (focused.value.length > 0)
                tracks = tracks.filter((track) =>
                    track.title
                        .toLowerCase()
                        .includes(focused.value.toLowerCase())
                );

            return this.some(
                tracks.map((track) => ({
                    name: `${startCase(track.source)} - ${truncate(track.title, { length: 10 })} (${track.author})`,
                    value: track.id
                }))
            );
        }

        return this.none();
    }
}
