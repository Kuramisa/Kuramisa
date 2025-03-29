import { AbstractEvent, Event } from "classes/Event";
import { useQueue } from "discord-player";
import type { Message } from "discord.js";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "messageDelete",
    description: "Event that triggers when a music message is deleted",
})
export default class MusicMessageDeletedEvent extends AbstractEvent {
    run(message: Message) {
        if (!this.client.isReady()) return;
        if (!message.inGuild()) return;

        const queue = useQueue<QueueMetadata>(message.guild);
        if (!queue) return;

        const { message: msg } = queue.metadata;

        if (msg && msg.author.id === this.client.user.id) {
            queue.metadata.message = null;
            queue.delete();
        }
    }
}
