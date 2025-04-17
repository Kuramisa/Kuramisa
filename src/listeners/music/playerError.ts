import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class MusicPlayerErrorEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "playerError",
            name: "music-player-error",
            description: "Event that triggers when a music player error occurs",
            emitter: container.client.systems.music.events,
        });
    }

    run(queue: GuildQueue<QueueMetadata>, error: string) {
        const { guild } = queue;

        container.logger.error(
            `[Music Player] Guild: ${guild.name} (${guild.id}) -  ${error}`,
        );
    }
}
