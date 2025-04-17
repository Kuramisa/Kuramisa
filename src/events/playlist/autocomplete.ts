import { AbstractEvent, Event } from "classes/Event";
import type { Interaction } from "discord.js";

import capitalize from "lodash/capitalize";
import truncate from "lodash/truncate";

@Event({
    event: "interactionCreate",
    description: "Autocomplete for playlist system",
})
export default class PlaylistAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "playlist") return;

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

        if (name === "playlist_name") {
            let playlists = db.playlists;

            if (value.length > 0)
                playlists = playlists.filter((p) =>
                    p.name.toLowerCase().includes(value.toLowerCase()),
                );

            playlists = playlists.slice(0, 25);

            await interaction.respond(
                playlists.map((playlist) => ({
                    name: `${playlist.name}${playlist.description ? ` - ${truncate(playlist.description, { length: 50 })}` : ""}`,
                    value: playlist.id,
                })),
            );
        } else if (name === "playlist_url") {
            if (value.length < 3) return;
            const result = await music.search(value);

            if (!result.playlist) return;

            const { author, title, tracks, source, type, url } =
                result.playlist;

            return interaction.respond([
                {
                    name: `${title} by ${author.name} - ${tracks.length} tracks - ${capitalize(source)} - ${capitalize(type)}`,
                    value: url,
                },
            ]);
        }
    }
}
