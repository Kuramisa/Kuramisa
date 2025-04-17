import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class QueueErrorEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "queueError",
            description: "Event that triggers when a music queue error occurs",
            emitter: container.client.systems.music.events,
        });
    }

    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        container.logger.error(
            `[Music Queue] Guild: ${guild.name} (${guild.id}) ${error}`,
        );
    }
}
