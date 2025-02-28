import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "uncaughtException",
    description: "Logs uncaught exceptions",
    emitter: process,
})
export default class UncaughtExceptionEvent extends AbstractEvent {
    run(err: Error) {
        logger.error(err);
    }
}
