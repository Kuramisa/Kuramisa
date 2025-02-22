import kuramisa from "@kuramisa";
import { AbstractEvent, Event } from "classes/Event";
import logger from "Logger";

@Event({
    event: "restDebug",
    description: "REST Debug Event",
    emitter: kuramisa.rest,
})
export default class RestDebugEvent extends AbstractEvent {
    run(debug: string) {
        logger.debug(debug);
    }
}
