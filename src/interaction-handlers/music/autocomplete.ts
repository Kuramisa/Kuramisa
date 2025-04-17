import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { useMainPlayer, useQueue } from "discord-player";
import type { AutocompleteInteraction } from "discord.js";
import startCase from "lodash/startCase";
import truncate from "lodash/truncate";

export default class MusicAutocompleteEvent extends InteractionHandler {
    constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    async run(interaction: AutocompleteInteraction) {
        const { options } = interaction;

        const { name, value } = options.getFocused(true);
        const player = useMainPlayer();

        switch (name) {
            case "track_or_playlist_name_or_url": {
                if (value.length < 3) return;

                const search = await player.search(value, {
                    requestedBy: interaction.user,
                });

                if (search.isEmpty()) return;

                if (search.hasPlaylist() && search.playlist) {
                    const { playlist } = search;

                    return interaction.respond([
                        {
                            name: `${truncate(playlist.title, { length: 60 })} (${playlist.author.name}) [${playlist.tracks.length} Tracks]`,
                            value: playlist.url,
                        },
                    ]);
                }

                let { tracks } = search;

                if (value.length > 0)
                    tracks = tracks.filter((t) =>
                        t.title.toLowerCase().includes(value.toLowerCase()),
                    );

                tracks = tracks.slice(0, 25);

                return interaction.respond(
                    tracks.map((track) => ({
                        name: `${truncate(track.title, { length: 60 })} (${track.author})`,
                        value: track.url,
                    })),
                );
            }
            case "track_in_queue": {
                if (!interaction.inCachedGuild()) return;
                const queue = useQueue(interaction.guildId);
                if (!queue) return;

                let tracks = queue.tracks.toArray();
                if (tracks.length < 1) return;
                if (value.length > 0)
                    tracks = tracks.filter((t) =>
                        t.title.toLowerCase().includes(value.toLowerCase()),
                    );

                tracks = tracks.slice(0, 25);

                return interaction.respond(
                    tracks.map((track) => ({
                        name: `${startCase(track.source as string)} - ${truncate(track.title, { length: 50 })} (${track.author})`,
                        value: track.id,
                    })),
                );
            }
            case "player_filters": {
                if (!interaction.inCachedGuild()) return;
                const queue = useQueue(interaction.guildId);
                if (!queue) return;

                const {
                    filters: { ffmpeg: filters },
                } = queue;

                const activeFilters = filters.getFiltersEnabled();
                const disabledFilters = filters.getFiltersDisabled();

                let filterList = [
                    ...activeFilters.map((f) => ({
                        name: `${startCase(f)} (On)`,
                        value: f,
                    })),
                    ...disabledFilters.map((f) => ({
                        name: `${startCase(f)} (Off)`,
                        value: f,
                    })),
                ];

                if (value.length > 0)
                    filterList = filterList.filter((f) =>
                        f.name.toLowerCase().includes(value.toLowerCase()),
                    );

                filterList = filterList.slice(0, 25);

                return interaction.respond(filterList);
            }
        }
    }

    parse(interaction: AutocompleteInteraction) {
        if (!["playlist", "music"].includes(interaction.commandName))
            return this.none();

        return this.some();
    }
}
