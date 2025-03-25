import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerResume",
    description: "Event that triggers when a music player is resumed",
    emitter: "music-queue",
})
export default class PlayerResumeEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            content: "",
            components: music.playerControls(),
        });
    }
}
