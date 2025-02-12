import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";
import type { GuildTextBasedChannel } from "discord.js";

@Event({
    event: "emptyQueue",
    description: "Empty queue event",
    emitter: kuramisa.systems.music.events,
})
export default class EmptyQueueEvent extends AbstractEvent {
    async run(queue: GuildQueue<GuildTextBasedChannel>) {
        const { guild } = queue;

        const channel = queue.metadata;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content: "> 😊 The queue is empty",
                embeds: [],
                components: [],
            });
            return;
        }

        guild.musicMessage = await channel.send({
            content: "> 😊 The queue is empty",
        });
    }
}
