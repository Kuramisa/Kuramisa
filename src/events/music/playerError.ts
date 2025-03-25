import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import logger from "Logger";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerError",
    description: "Event that triggers when a music player error occurs",
    emitter: "music-queue",
})
export default class MusicPlayerErrorEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        logger.error(
            `[Music Player] Guild: ${guild.name} (${guild.id}) -  ${error}`,
        );
    }
}
