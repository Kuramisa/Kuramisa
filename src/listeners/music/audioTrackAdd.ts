import { container, Listener } from "@sapphire/framework";
import { GuildQueue, Track } from "discord-player";

export class AudioTrackAddListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Audio Track Add",
            event: "audioTrackAdd",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue, track: Track) {
        const { client, util } = container;

        if (!queue) return;
        if (!queue.currentTrack?.url) return;

        const { guild } = queue;
        const { channel } = queue.metadata as Metadata;

        const embed = util
            .embed()
            .setAuthor({
                name: "Added to Queue",
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
            const oldEmbed = guild.musicMessage.embeds[0];
            try {
                await guild.musicMessage.edit({ embeds: [embed] });
                setTimeout(() => {
                    guild.musicMessage?.edit({ embeds: [oldEmbed] });
                }, 3000);
            } catch (error) {
                guild.musicMessage = await channel.send({ embeds: [embed] });
                setTimeout(() => {
                    guild.musicMessage?.edit({ embeds: [oldEmbed] });
                }, 3000);
            }
        } else {
            guild.musicMessage = await channel.send({ embeds: [embed] });
        }
    }
}
