import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";

@KEvent({
    event: "emptyChannel",
    description: "Empty channel event",
    emitter: kuramisa.systems.music.events
})
export default class Event extends AbstractKEvent {
    async run(queue: GuildQueue) {
        const { guild } = queue;

        const { channel } = queue.metadata as IMetadata;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content:
                    "> 🥲 The voice channel got lonely , so I left the channel",
                embeds: []
            });
            queue.connection?.disconnect();
            queue.delete();
            return;
        }

        guild.musicMessage = await channel.send({
            content: "> 🥲 The voice channel is empty, so I left the channel",
            embeds: [],
            components: []
        });

        queue.connection?.disconnect();
        queue.delete();
    }
}
