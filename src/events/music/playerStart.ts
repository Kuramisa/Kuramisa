import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue, Track } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerStart",
    description:
        "Event that triggers when a music player starts playing a song",
    emitter: "music-queue",
})
export default class PlayerStartEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        const {
            guild,
            metadata: { textChannel },
        } = queue;

        const {
            systems: { music },
        } = this.client;

        if (guild.musicMessage) {
            guild.musicMessage.edit({
                content: "",
                embeds: [await music.nowPlayingEmbed(queue, track)],
                components: music.playerControls(),
            });
            return;
        }

        guild.musicMessage = await textChannel.send({
            embeds: [await music.nowPlayingEmbed(queue, track)],
            components: music.playerControls(),
        });
    }
}
