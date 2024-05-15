import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { GuildQueue, Track } from "discord-player";

@KEvent({
    event: "playerStart",
    description:
        "Event that triggers when a music player starts playing a song",
    emitter: kuramisa.systems.music.events
})
export default class PlayerStartEvent extends AbstractKEvent {
    async run(queue: GuildQueue, track: Track) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        const { channel } = queue.metadata as IMetadata;

        if (guild.musicMessage) {
            guild.musicMessage.edit({
                content: "",
                embeds: [await music.nowPlayingEmbed(queue, track)],
                components: music.playerControls()
            });
            return;
        }

        guild.musicMessage = await channel.send({
            embeds: [await music.nowPlayingEmbed(queue, track)],
            components: music.playerControls()
        });
    }
}
