import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "debug",
    description: "Debug event for music system",
    emitter: "music-player",
})
export default class MusicDebugEvent extends AbstractEvent {
    run(debug: string) {
        logger.debug(`[Music] ${debug}`);
    }
}
