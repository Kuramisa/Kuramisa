import { KEmbed } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import {} from "@utils";
import { GuildQueue, QueueRepeatMode, Track } from "discord-player";

@KEvent({
    event: "audioTrackAdd",
    description: "Event when a track is added to the queue",
    emitter: kuramisa.systems.music.events
})
export default class AudioTrackAddEvent extends AbstractKEvent {
    async run(queue: GuildQueue, track: Track) {
        if (queue.currentTrack === null) return;
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        const { channel } = queue.metadata as IMetadata;

        const embed = new KEmbed()
            .setAuthor({ name: "Added to queue" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${music.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n${music.loopEmoji(queue.repeatMode)} **Loop Mode:** ${
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
                        content: "",
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
