import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "error",
    description: "Error event for music queue system",
    emitter: "music-queue",
})
export default class QueueErrorEvent extends AbstractEvent {
    async run(_: any, error: string) {
        logger.error(`[Music Queue] ${error}`);
    }
}
