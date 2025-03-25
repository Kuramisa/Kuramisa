import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerPause",
    description: "Pause event for music player",
    emitter: "music-queue",
})
export default class PlayerPauseEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            content: "",
            components: music.playerControls(true),
        });
    }
}
