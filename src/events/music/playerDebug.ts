import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import logger from "Logger";

@Event({
    event: "debug",
    description: "Debug event for music player",
    emitter: kuramisa.systems.music.events,
})
export default class MusicPlayerDebugEvent extends AbstractEvent {
    async run(_: any, debug: string) {
        logger.debug(`[Music Player] ${debug}`);
    }
}
