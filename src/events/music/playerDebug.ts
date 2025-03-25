import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "debug",
    description: "Debug event for music player",
    emitter: "music-queue",
})
export default class MusicPlayerDebugEvent extends AbstractEvent {
    async run(_: any, debug: string) {
        logger.debug(`[Music Player] ${debug}`);
    }
}
