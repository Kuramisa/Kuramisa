import { container, Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import { type GuildQueue, QueueRepeatMode, type Track } from "discord-player";
import type { QueueMetadata } from "typings/Music";

export default class AudioTrackAddEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "audioTrackAdd",
            name: "audio-track-add",
            description: "Event when a track is added to the queue",
            emitter: container.client.systems.music.events,
        });
    }

    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        if (queue.currentTrack === null) return;

        const {
            kEmojis: emojis,
            systems: { music },
        } = container.client;

        const embed = new Embed()
            .setAuthor({ name: "Added to queue" })
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
