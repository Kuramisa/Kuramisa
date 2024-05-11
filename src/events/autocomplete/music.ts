import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { useMainPlayer, useQueue } from "discord-player";
import { Interaction } from "discord.js";
import { startCase, truncate } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage Music autocomplete interaction."
})
export default class MusicAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "music") return;

        const { options } = interaction;

        const focused = options.getFocused(true);
        const player = useMainPlayer();

        if (focused.name === "track_or_playlist_url") {
            if (focused.value.length < 1)
                return interaction.respond([
                    {
                        name: "Random Song",
                        value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    }
                ]);

            const search = await player.search(focused.value, {
                requestedBy: interaction.user
            });

            if (search.isEmpty()) return;

            if (search.hasPlaylist() && search.playlist) {
                const { playlist } = search;

                return interaction.respond([
                    {
                        name: `${startCase(playlist.source)} ${startCase(playlist.type)} - ${truncate(playlist.title, { length: 20 })} (${playlist.author.name}) [${playlist.tracks.length} Tracks]`,
                        value: playlist.url
                    }
                ]);
            }

            const { tracks } = search;

            return interaction.respond(
                tracks.map((track) => ({
                    name: `${truncate(track.title, { length: 15 })} (${track.author})`,
                    value: track.url
                }))
            );
        } else if (focused.name === "track_in_queue") {
            if (!interaction.guildId) return;

            const queue = useQueue(interaction.guildId);
            if (!queue) return;

            let tracks = queue.tracks.toArray();
            if (tracks.length < 1) return;
            if (focused.value.length > 0)
                tracks = tracks.filter((t) =>
                    t.title.toLowerCase().includes(focused.value.toLowerCase())
                );

            tracks = tracks.slice(0, 25);

            return interaction.respond(
                tracks.map((track) => ({
                    name: `${startCase(track.source)} - ${truncate(track.title, { length: 10 })} (${track.author})`,
                    value: track.id
                }))
            );
        }
    }
}
