import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";

@KEvent({
    event: "error",
    description: "Error event for music queue system",
    emitter: kuramisa.systems.music.events
})
export default class QueueErrorEvent extends AbstractKEvent {
    async run(_: any, error: string) {
        this.logger.error(`[Music Queue] ${error}`);
    }
}
