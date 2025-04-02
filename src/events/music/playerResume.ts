import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerResume",
    description: "Event that triggers when a music player is resumed",
    emitter: container.client.systems.music.events,
})
export default class PlayerResumeEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const {
            systems: { music },
        } = this.container.client;

        await music.updateMessage(queue, {
            content: "",
            components: music.playerControls(),
        });
    }
}
