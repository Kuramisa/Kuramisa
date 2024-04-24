import { Listener, container } from "@sapphire/framework";
import { GuildQueue, QueueRepeatMode, Track } from "discord-player";

export class AudioTrackRemoveListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "audioTrackRemove",
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
            .setAuthor({ name: "Removed from queue" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${await util.toEmoji(music.volumeEmoji(queue.node.volume))} **Volume** ${queue.node.volume}%\n${await util.toEmoji(music.loopEmoji(queue.repeatMode))} **Loop Mode:** ${
                    queue.repeatMode === QueueRepeatMode.TRACK
                        ? "Track"
                        : queue.repeatMode === QueueRepeatMode.QUEUE
                          ? "Queue"
                          : "Off"
                }`
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy?.globalName ?? track.requestedBy?.username}`,
                iconURL: track.requestedBy?.displayAvatarURL()
            })
            .setURL(track.url);

        if (guild.musicMessage) {
            const oldEmbed = guild.musicMessage.embeds[0];

            await guild.musicMessage
                .edit({
                    content: "",
                    embeds: [embed],
                    components: music.playerControls()
                })
                .then((m) => {
                    setTimeout(() => {
                        m.edit({
                            content: "",
                            embeds: [oldEmbed]
                        });
                    }, 5000);
                });
            return;
        }

        guild.musicMessage = await channel
            .send({
                embeds: [embed],
                components: music.playerControls()
            })
            .then((m) => {
                setTimeout(async () => {
                    if (!queue.currentTrack) return null;
                    m.edit({
                        embeds: [
                            await music.nowPlayingEmbed(
                                queue,
                                queue.currentTrack
                            )
                        ]
                    });
                }, 5000);
                return m;
            });
    }
}
