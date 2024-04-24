import { Listener } from "@sapphire/framework";
import { container } from "@sapphire/framework";
import { GuildQueue, Track } from "discord-player";

export class PlayerStartListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "playerStart",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue, track: Track) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.container;

        const { channel } = queue.metadata as IMetadata;

        if (guild.musicMessage) {
            guild.musicMessage.edit({
                content: "",
                embeds: [await music.nowPlayingEmbed(queue, track)],
                components: music.playerControls()
            });
            return;
        }

        guild.musicMessage = await channel.send({
            embeds: [await music.nowPlayingEmbed(queue, track)],
            components: music.playerControls()
        });
    }
}
