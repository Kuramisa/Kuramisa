import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";

export class EmptyQueueListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "emptyQueue",
            emitter: container.systems.music.events
        });
    }

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
