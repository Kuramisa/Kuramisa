import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";

@KEvent({
    event: "debug",
    description: "Debug event for music system",
    emitter: kuramisa.systems.music
})
export default class Event extends AbstractKEvent {
    async run(debug: string) {
        this.logger.debug(`[Music] ${debug}`);
    }
}
