import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export default class PlaylistAutocomplete extends InteractionHandler {
    constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            name: "playlist-autocomplete",
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    async run(interaction: AutocompleteInteraction) {
        const {
            client: {
                managers,
                systems: { music },
            },
            options,
            user,
        } = interaction;

        const db = await managers.users.get(user.id);

        const { name, value } = options.getFocused(true);

        switch (name) {
            case "playlist_name": {
                let { playlists } = db;

                if (value.length > 0)
                    playlists = playlists.filter((p) =>
                        p.name.toLowerCase().includes(value.toLowerCase()),
                    );

                playlists = playlists.slice(0, 25);

                return interaction.respond(
                    playlists.map((playlist) => ({
                        name: `${playlist.name}${playlist.description ? ` - ${playlist.description}` : ""}`,
                        value: playlist.id,
                    })),
                );
            }
            case "playlist_url": {
                if (value.length < 3) return;
                const result = await music.search(value);

                if (!result.playlist) return;
                const { author, title, tracks, source, type, url } =
                    result.playlist;

                return interaction.respond([
                    {
                        name: `${title} by ${author.name} - ${tracks.length} tracks - ${source} - ${type}`,
                        value: url,
                    },
                ]);
            }
        }
    }

    parse(inteaction: AutocompleteInteraction) {
        if (inteaction.commandName !== "playlist") return this.none();

        return this.some();
    }
}
