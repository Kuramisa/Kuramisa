import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import logger from "Logger";

@Event({
    event: "playerError",
    description: "Event that triggers when a music player error occurs",
    emitter: kuramisa.systems.music.events,
})
export default class MusicPlayerErrorEvent extends AbstractEvent {
    async run(_: any, error: string) {
        logger.error(`[Music Player] ${error}`);
    }
}
