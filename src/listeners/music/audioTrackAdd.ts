import { Listener, container } from "@sapphire/framework";
import { GuildQueue, Track } from "discord-player";

export class AudioTrackAddListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "audioTrackAdd",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue, track: Track) {
        const { guild } = queue;

        const {
            util,
            systems: { music }
        } = this.container;

        const { channel } = queue.metadata as IMetadata;

        const embed = util
            .embed()
            .setAuthor({ name: "Added to queue" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${music.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n**Duration** 0:00/${track.duration}`
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy?.globalName || track.requestedBy?.username}`,
                iconURL: track.requestedBy?.displayAvatarURL()
            })
            .setURL(track.url);

        if (guild.musicMessage) {
            const oldEmbed = guild.musicMessage.embeds[0];

            await guild.musicMessage
                .edit({
                    embeds: [embed]
                })
                .then((m) => {
                    setTimeout(() => {
                        m.edit({
                            embeds: [oldEmbed]
                        });
                    }, 5000);
                });
            return;
        }

        guild.musicMessage = await channel.send({
            embeds: [embed],
            components: music.playerControls()
        });
    }
}
