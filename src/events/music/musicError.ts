import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "error",
    description: "Error event for music system",
    emitter: "music-player",
})
export default class MusicErrorEvent extends AbstractEvent {
    run(error: string) {
        logger.error(`[Music] ${error}`);
    }
}
