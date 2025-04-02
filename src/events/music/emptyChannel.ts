import { container } from "@sapphire/framework";
import { sleep } from "@sapphire/utilities";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "emptyChannel",
    description: "Empty channel event",
    emitter: container.client.systems.music.events,
})
export default class EmptyChannelEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { message } = queue.metadata;

        await this.container.client.systems.music.updateMessage(queue, {
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
