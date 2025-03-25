import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import logger from "Logger";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "error",
    description: "Error event for music queue system",
    emitter: "music-queue",
})
export default class QueueErrorEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        logger.error(
            `[Music Queue] Guild: ${guild.name} (${guild.id}) ${error}`,
        );
    }
}
