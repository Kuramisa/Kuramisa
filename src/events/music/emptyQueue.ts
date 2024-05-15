import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";

@KEvent({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: kuramisa.systems.music.events
})
export default class EmptyQueueEvent extends AbstractKEvent {
    async run(queue: GuildQueue) {
        const { guild } = queue;

        const { channel } = queue.metadata as IMetadata;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content: "> 😊 The queue is empty",
                embeds: [],
                components: []
            });
            return;
        }

        guild.musicMessage = await channel.send({
            content: "> 😊 The queue is empty"
        });
    }
}
