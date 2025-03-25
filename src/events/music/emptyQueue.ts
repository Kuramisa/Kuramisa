import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import logger from "Logger";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: "music-queue",
})
export default class EmptyQueueEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { guild } = queue;

        const { textChannel } = queue.metadata;

        if (guild.musicMessage) {
            await guild.musicMessage
                .edit({
                    content: "> 😊 The queue is empty",
                    embeds: [],
                    components: [],
                })
                .catch((err) => logger.error(err));
            return;
        }

        guild.musicMessage = await textChannel.send({
            content: "> 😊 The queue is empty",
        });
    }
}
