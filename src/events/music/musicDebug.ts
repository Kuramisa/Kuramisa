import { AbstractEvent, Event } from "classes/Event";

import logger from "Logger";

@Event({
    event: "debug",
    description: "Debug event for music system",
    emitter: kuramisa.systems.music,
})
export default class MusicDebugEvent extends AbstractEvent {
    async run(debug: string) {
        logger.debug(`[Music] ${debug}`);
    }
}
