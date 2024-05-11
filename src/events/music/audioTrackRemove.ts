import { KEmbed } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { toEmoji } from "@utils";
import { GuildQueue, QueueRepeatMode, Track } from "discord-player";

@KEvent({
    event: "audioTrackRemove",
    description: "Fired when an audio track is removed from the queue",
    emitter: kuramisa.systems.music.events
})
export default class Event extends AbstractKEvent {
    async run(queue: GuildQueue, track: Track) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        const { channel } = queue.metadata as IMetadata;

        const embed = new KEmbed()
            .setAuthor({ name: "Removed from queue" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${await toEmoji(music.volumeEmoji(queue.node.volume))} **Volume** ${queue.node.volume}%\n${await toEmoji(music.loopEmoji(queue.repeatMode))} **Loop Mode:** ${
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
