import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "unhandledRejection",
    description: "Unhandled rejection event",
    emitter: "process",
})
export default class UnhandledRejectionEvent extends AbstractEvent {
    run(reason: any, promise: any) {
        logger.error(`[Unhandled Rejection] ${reason} Promise: ${promise}`);
    }
}
