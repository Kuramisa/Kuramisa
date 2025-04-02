import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";
@Event({
    event: "playerError",
    description: "Event that triggers when a music player error occurs",
    emitter: container.client.systems.music.events,
})
export default class MusicPlayerErrorEvent extends AbstractEvent {
    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        this.container.logger.error(
            `[Music Player] Guild: ${guild.name} (${guild.id}) -  ${error}`,
        );
    }
}
