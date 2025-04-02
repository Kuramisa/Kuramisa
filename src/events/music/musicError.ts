import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
@Event({
    event: "error",
    description: "Error event for music system",
    emitter: container.client.systems.music,
})
export default class MusicErrorEvent extends AbstractEvent {
    run(error: string) {
        this.container.logger.error(`[Music] ${error}`);
    }
}
