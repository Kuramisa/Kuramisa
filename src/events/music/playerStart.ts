import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import { GuildQueue, Track } from "discord-player";

@Event({
    event: "playerStart",
    description:
        "Event that triggers when a music player starts playing a song",
    emitter: kuramisa.systems.music.events,
})
export default class PlayerStartEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>, track: Track) {
        const {
            guild,
            metadata: { textChannel },
        } = queue;

        const {
            systems: { music },
        } = this.client;

        if (guild.musicMessage) {
            guild.musicMessage.edit({
                content: "",
                embeds: [await music.nowPlayingEmbed(queue, track)],
                components: music.playerControls(),
            });
            return;
        }

        guild.musicMessage = await textChannel.send({
            embeds: [await music.nowPlayingEmbed(queue, track)],
            components: music.playerControls(),
        });
    }
}
