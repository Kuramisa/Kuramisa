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
            systems: { music },
        } = this.client;

        await music.updateMessage(queue, {
            content: "",
            embeds: [music.nowPlayingEmbed(queue, track)],
            components: music.playerControls(queue.node.isPaused()),
        });
    }
}
