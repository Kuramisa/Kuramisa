import { Embed } from "@builders";
import kuramisa from "@kuramisa";
import { AbstractEvent, Event } from "classes/Event";
import { type GuildQueue, type Track, QueueRepeatMode } from "discord-player";

@Event({
    event: "audioTrackAdd",
    description: "Event when a track is added to the queue",
    emitter: kuramisa.systems.music.events,
})
export default class AudioTrackAddEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        if (queue.currentTrack === null) return;
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        const { textChannel } = queue.metadata;

        const embed = new Embed()
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
                text: `Requested by ${track.requestedBy?.displayName}`,
                iconURL: track.requestedBy?.displayAvatarURL(),
            })
            .setURL(track.url);

        if (guild.musicMessage) {
            const oldEmbed = guild.musicMessage.embeds[0];

            await guild.musicMessage
                .edit({
                    content: "",
                    embeds: [embed],
                    components: music.playerControls(),
                })
                .then((m) => {
                    setTimeout(() => {
                        m.edit({
                            content: "",
                            embeds: [oldEmbed],
                        });
                    }, 5000);
                });
            return;
        }

        guild.musicMessage = await textChannel
            .send({
                embeds: [embed],
                components: music.playerControls(),
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
                            ),
                        ],
                    });
                }, 5000);
                return m;
            });
    }
}
