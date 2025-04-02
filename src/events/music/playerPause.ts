import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "playerPause",
    description: "Pause event for music player",
    emitter: container.client.systems.music.events,
})
export default class PlayerPauseEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const {
            systems: { music },
        } = this.container.client;

        await music.updateMessage(queue, {
            content: "",
            components: music.playerControls(true),
        });
    }
}
