import { Listener } from "@sapphire/framework";
import { useQueue } from "discord-player";
import type { Message } from "discord.js";
import type { QueueMetadata } from "typings/Music";

export default class MusicMessageDeletedEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
            name: "music-message-deleted",
            description: "Event that triggers when a music message is deleted",
        });
    }

    run(message: Message) {
        if (!message.inGuild()) return;

        const queue = useQueue<QueueMetadata>(message.guild);
        if (!queue) return;

        const { message: msg } = queue.metadata;

        if (msg && msg.author.id === message.client.user.id) {
            queue.metadata.message = null;
            queue.delete();
        }
    }
}
