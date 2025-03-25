import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "emptyChannel",
    description: "Empty channel event",
    emitter: "music-queue",
})
export default class EmptyChannelEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { guild } = queue;

        const { textChannel } = queue.metadata;

        if (guild.musicMessage) {
            await guild.musicMessage.edit({
                content:
                    "> 🥲 The voice channel got lonely , so I left the channel",
                embeds: [],
            });
            setTimeout(() => {
                guild.musicMessage?.delete();
                guild.musicMessage = null;
            }, 5000);
            queue.connection?.disconnect();
            queue.delete();
            return;
        }

        guild.musicMessage = await textChannel.send({
            content: "> 🥲 The voice channel got lonely, so I left the channel",
            embeds: [],
            components: [],
        });

        setTimeout(() => {
            guild.musicMessage?.delete();
            guild.musicMessage = null;
        }, 5000);

        queue.connection?.disconnect();
        queue.delete();
    }
}
