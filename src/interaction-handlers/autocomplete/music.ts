import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";

import { useMainPlayer } from "discord-player";
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
                        value: "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=449b1042f9944f8c"
                    }
                ]);

            if (focused.value.includes("youtube")) {
                return this.some([
                    {
                        name: "We do not support YouTube, because of their TOS. We are sorry.",
                        value: "no_youtube"
                    }
                ]);
            }

            const search = await player.search(focused.value, {
                requestedBy: interaction.user
            });

            if (search.isEmpty()) return this.none();

            if (search.hasPlaylist() && search.playlist) {
                const { playlist } = search;

                return this.some([
                    {
                        name: `${startCase(playlist.source)} ${startCase(playlist.type)} - ${playlist.title} (${playlist.author.name}) [${playlist.tracks.length} Tracks]`,
                        value: playlist.url
                    }
                ]);
            }

            const { tracks } = search;

            return this.some(
                tracks.map((track) => ({
                    name: `${startCase(track.source)} - ${truncate(track.title, { length: 20 })} (${track.author})`,
                    value: track.url
                }))
            );
        }

        return this.none();
    }
}
