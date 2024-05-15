import kuramisa from "@kuramisa";
import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "restDebug",
    description: "REST Debug event",
    emitter: kuramisa.rest
})
export default class RestDebugEvent extends AbstractKEvent {
    async run(debug: string) {
        this.logger.debug(debug);
    }
}
