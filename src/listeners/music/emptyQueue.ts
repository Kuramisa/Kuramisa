import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class EmptyQueueEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "emptyQueue",
            description: "Event when the queue is empty",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>) {
        await container.client.systems.music.updateMessage(queue, {
            embeds: [],
            components: [],
            content: "> 😊 The queue is empty",
        });
    }
}
