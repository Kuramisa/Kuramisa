import { container } from "@sapphire/framework";
import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue, Track } from "discord-player";
import { QueueRepeatMode } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "audioTrackRemove",
    description: "Fired when an audio track is removed from the queue",
    emitter: container.client.systems.music.events,
})
export default class AudioTrackRemoveEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        const {
            kEmojis: emojis,
            systems: { music },
        } = this.container.client;

        const embed = new Embed()
            .setAuthor({ name: "Removed from queue" })
            .setTitle(`${track.title} - ${track.author}`)
            .setDescription(
                `${emojis.get("time") ?? "⏰"} **Duration**: ${track.duration}\n\n${music.volumeEmoji(queue.node.volume)} **Volume** ${queue.node.volume}%\n${music.loopEmoji(queue.repeatMode)} **Loop Mode:** ${
                    queue.repeatMode === QueueRepeatMode.TRACK
                        ? "Track"
                        : queue.repeatMode === QueueRepeatMode.QUEUE
                          ? "Queue"
                          : "Off"
                }`,
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Requested by ${track.requestedBy?.displayName}`,
                iconURL: track.requestedBy?.displayAvatarURL(),
            })
            .setURL(track.url);

        const nowPlaying = music.nowPlayingEmbed(queue);

        await music.updateMessage(
            queue,
            {
                embeds: [embed],
                components: [],
                content: "",
            },
            {
                embeds: nowPlaying ? [nowPlaying] : [],
                components: music.playerControls(queue.node.isPaused()),
                content: "",
            },
        );
    }
}
