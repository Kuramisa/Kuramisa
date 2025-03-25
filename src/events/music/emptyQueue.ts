import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";
@Event({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: "music-queue",
})
export default class EmptyQueueEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        await this.client.systems.music.updateMessage(queue, {
            embeds: [],
            components: [],
            content: "> 😊 The queue is empty",
        });
    }
}
