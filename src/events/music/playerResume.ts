import { AbstractEvent, Event } from "classes/Event";

import { GuildQueue } from "discord-player";

@Event({
    event: "playerResume",
    description: "Event that triggers when a music player is resumed",
    emitter: kuramisa.systems.music.events,
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
