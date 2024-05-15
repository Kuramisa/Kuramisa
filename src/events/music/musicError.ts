import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";

@KEvent({
    event: "error",
    description: "Error event for music system",
    emitter: kuramisa.systems.music
})
export default class MusicErrorEvent extends AbstractKEvent {
    async run(error: string) {
        this.logger.error(`[Music] ${error}`);
    }
}
