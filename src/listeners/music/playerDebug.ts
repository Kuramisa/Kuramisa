import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class MusicPlayerDebugEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "debug",
            name: "music-player-debug",
            description: "Debug event for music player",
            emitter: container.client.systems.music.events,
        });
    }

    run(queue: GuildQueue<QueueMetadata>, debug: string) {
        const { guild } = queue;

        container.logger.debug(
            `[Music Player] Guild: ${guild.name} - ${guild.id} ${debug}`,
        );
    }
}
