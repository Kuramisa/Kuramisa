import { AbstractEvent, Event } from "classes/Event";
import { useMainPlayer, useQueue } from "discord-player";
import type { Interaction } from "discord.js";

import startCase from "lodash/startCase";
import truncate from "lodash/truncate";

@Event({
    event: "interactionCreate",
    description: "Manage Music AutoComplete interactions.",
})
export default class MusicAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete() || !interaction.inCachedGuild())
            return;
        if (!["playlist", "music"].includes(interaction.commandName)) return;

        const { options } = interaction;

        const focused = options.getFocused(true);
        const player = useMainPlayer();

        switch (focused.name) {
            case "track_or_playlist_name_or_url": {
                if (focused.value.length < 3) return;

                const search = await player.search(focused.value, {
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

                if (focused.value.length > 0)
                    tracks = tracks.filter((t) =>
                        t.title
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );

                tracks = tracks.slice(0, 25);

                return interaction.respond(
                    tracks.map((track) => ({
                        name: `${truncate(track.title, { length: 60 })} (${track.author})`,
                        value: track.url,
                    }))
                );
            }
            case "track_in_queue": {
                const queue = useQueue(interaction.guildId);
                if (!queue) return;

                let tracks = queue.tracks.toArray();
                if (tracks.length < 1) return;
                if (focused.value.length > 0)
                    tracks = tracks.filter((t) =>
                        t.title
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );

                tracks = tracks.slice(0, 25);

                return interaction.respond(
                    tracks.map((track) => ({
                        name: `${startCase(track.source)} - ${truncate(track.title, { length: 50 })} (${track.author})`,
                        value: track.id,
                    }))
                );
            }
        }
    }
}
