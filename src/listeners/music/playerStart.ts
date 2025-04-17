import { container, Listener } from "@sapphire/framework";
import type { GuildQueue, Track } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class PlayerStartEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "playerStart",
            description:
                "Event that triggers when a music player starts playing a song",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        const {
            systems: { music },
        } = container.client;

        await music.updateMessage(queue, {
            content: "",
            embeds: [music.nowPlayingEmbed(queue, track)],
            components: music.playerControls(queue.node.isPaused()),
        });
    }
}
