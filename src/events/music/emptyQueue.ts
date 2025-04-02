import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";
@Event({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: container.client.systems.music.events,
})
export default class EmptyQueueEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        await this.container.client.systems.music.updateMessage(queue, {
            embeds: [],
            components: [],
            content: "> 😊 The queue is empty",
        });
    }
}
