import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
@Event({
    event: "debug",
    description: "Debug event for music system",
    emitter: container.client.systems.music,
})
export default class MusicDebugEvent extends AbstractEvent {
    run(debug: string) {
        container.logger.debug(`[Music] ${debug}`);
    }
}
