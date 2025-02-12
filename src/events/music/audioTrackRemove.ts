import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";

import { GuildQueue, QueueRepeatMode, Track } from "discord-player";
import { Embed } from "@builders";
import type { GuildTextBasedChannel } from "discord.js";

@Event({
    event: "audioTrackRemove",
    description: "Fired when an audio track is removed from the queue",
    emitter: kuramisa.systems.music.events,
})
export default class AudioTrackRemoveEvent extends AbstractEvent {
    async run(queue: GuildQueue<GuildTextBasedChannel>, track: Track) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        const channel = queue.metadata;

        const embed = new Embed()
            .setAuthor({ name: "Removed from queue" })
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

        guild.musicMessage = await channel
            .send({
                embeds: [embed],
                components: music.playerControls(),
            })
            .then((m) => {
                setTimeout(async () => {
                    if (!queue.currentTrack) return null;
                    m.edit({
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
