import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import logger from "Logger";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "debug",
    description: "Debug event for music player",
    emitter: "music-queue",
})
export default class MusicPlayerDebugEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, debug: string) {
        const { guild } = queue;
        logger.debug(
            `[Music Player] Guild: ${guild.name} - ${guild.id} ${debug}`,
        );
    }
}
