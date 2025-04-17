import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";
@Event({
    event: "error",
    description: "Error event for music queue system",
    emitter: container.client.systems.music.events,
})
export default class QueueErrorEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        container.logger.error(
            `[Music Queue] Guild: ${guild.name} (${guild.id}) ${error}`,
        );
    }
}
