import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "uncaughtException",
    description: "Unhandled exception event",
    emitter: "process",
})
export default class UnhandledExceptionEvent extends AbstractEvent {
    run(error: Error, origin: any) {
        logger.error(`[Uncaught Exception] ${error} Origin: ${origin}`);
    }
}
