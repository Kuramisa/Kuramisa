import { container, Listener } from "@sapphire/framework";
import { type GuildQueue, type Track } from "discord-player";

export class PlayerStartListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Player Start",
            event: "playerStart",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue, track: Track) {
        const { client, util } = this.container;

        const { guild } = queue;
        const { channel } = queue.metadata as IMetadata;

        const embed = util
            .embed()
            .setAuthor({
                name: "Now Playing",
                iconURL: client.user?.displayAvatarURL()
            })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(
                (track.raw.thumbnail as any)
                    ? (track.raw.thumbnail as any).url
                    : track.thumbnail
            )
            .addFields({
                name: "Duration",
                value: track.duration
            })
            .setFooter({
                text: `Requested by ${track.requestedBy?.tag}`,
                iconURL: track.requestedBy?.displayAvatarURL()
            });

        if (guild.musicMessage) {
            try {
                await guild.musicMessage.edit({ embeds: [embed] });
            } catch {
                guild.musicMessage = await channel.send({ embeds: [embed] });
            }
        } else {
            guild.musicMessage = await channel.send({ embeds: [embed] });
        }
    }
}
