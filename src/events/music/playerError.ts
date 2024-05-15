import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";

@KEvent({
    event: "playerError",
    description: "Event that triggers when a music player error occurs",
    emitter: kuramisa.systems.music.events
})
export default class MusicPlayerErrorEvent extends AbstractKEvent {
    async run(_: any, error: string) {
        this.logger.error(`[Music Player] ${error}`);
    }
}
