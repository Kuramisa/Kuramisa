import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";
import logger from "Logger";

@Event({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: kuramisa.systems.music.events,
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
