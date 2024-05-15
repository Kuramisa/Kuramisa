import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";

@KEvent({
    event: "debug",
    description: "Debug event for music player",
    emitter: kuramisa.systems.music.events
})
export default class MusicPlayerDebugEvent extends AbstractKEvent {
    async run(_: any, debug: string) {
        this.logger.debug(`[Music Player] ${debug}`);
    }
}
