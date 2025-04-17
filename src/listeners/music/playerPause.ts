import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class PlayerPauseEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "playerPause",
            description: "Event that triggers when the music player is paused",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>) {
        const {
            systems: { music },
        } = container.client;

        await music.updateMessage(queue, {
            content: "",
            components: music.playerControls(true),
        });
    }
}
