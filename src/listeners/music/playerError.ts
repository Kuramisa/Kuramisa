import { container, Listener } from "@sapphire/framework";
import type { QueueMetadata } from "@typings/Music";
import type { GuildQueue } from "discord-player";

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
