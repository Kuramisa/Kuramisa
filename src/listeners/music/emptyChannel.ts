import { container, Listener } from "@sapphire/framework";
import { sleep } from "@sapphire/utilities";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class EmptyChannelEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "emptyChannel",
            name: "empty-channel",
            description: "When a user leaves the voice channel",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>) {
        const { message } = queue.metadata;

        await container.client.systems.music.updateMessage(queue, {
            embeds: [],
            components: [],
            content: "> 🥲 The voice channel got lonely, so I left the channel",
        });

        if (!queue.connection) return;
        if (!message) return;

        await sleep(5000);
        message.delete().catch(() => null);
        queue.metadata.message = null;
        queue.connection.disconnect();
        queue.delete();
    }
}
