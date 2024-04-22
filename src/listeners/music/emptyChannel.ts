import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";

export class EmptyChannelListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "emptyChannel",
            emitter: container.systems.music.events
        });
    }

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
