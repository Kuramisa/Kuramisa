import { AbstractEvent, Event } from "classes/Event";
@Event({
    event: "restDebug",
    description: "REST Debug Event",
    emitter: "rest",
})
export default class RestDebugEvent extends AbstractEvent {
    run(debug: string) {
        this.container.logger.debug(debug);
    }
}
