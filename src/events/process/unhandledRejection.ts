import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "unhandledRejection",
    description: "Unhandled rejection",
    emitter: process,
})
export default class UnhandledRejection extends AbstractEvent {
    run(err: Error) {
        logger.error(err);
    }
}
