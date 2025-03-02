import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";
import process from "process";

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
