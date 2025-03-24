import { AbstractEvent, Event } from "classes/Event";

import logger from "Logger";

@Event({
    event: "error",
    description: "Error event for music system",
    emitter: kuramisa.systems.music,
})
export default class MusicErrorEvent extends AbstractEvent {
    async run(error: string) {
        logger.error(`[Music] ${error}`);
    }
}
