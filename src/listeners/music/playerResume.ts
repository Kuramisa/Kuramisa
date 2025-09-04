import { container, Listener } from "@sapphire/framework";
import type { QueueMetadata } from "@typings/Music";
import type { GuildQueue } from "discord-player";

export default class PlayerResumeEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "playerResume",
            name: "music-player-resume",
            description: "Event that triggers when the music player is resumed",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>) {
        const {
            systems: { music },
        } = container.client;

        await music.updateMessage(queue, {
            content: "",
            components: music.playerControls(),
        });
    }
}
