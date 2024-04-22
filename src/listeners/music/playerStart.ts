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
                embeds: [music.nowPlayingEmbed(queue, track)]
            });

            setInterval(() => {
                guild.musicMessage?.edit({
                    embeds: [music.nowPlayingEmbed(queue, track)]
                });
            }, 5000);

            return;
        }

        const msg = (guild.musicMessage = await channel.send({
            embeds: [music.nowPlayingEmbed(queue, track)],
            components: music.playerControls()
        }));

        setInterval(() => {
            msg.edit({
                embeds: [music.nowPlayingEmbed(queue, track)]
            });
        }, 5000);
    }
}
