import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";
@Event({
    event: "debug",
    description: "Debug event for music player",
    emitter: container.client.systems.music.events,
})
export default class MusicPlayerDebugEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, debug: string) {
        const { guild } = queue;
        this.container.logger.debug(
            `[Music Player] Guild: ${guild.name} - ${guild.id} ${debug}`,
        );
    }
}
