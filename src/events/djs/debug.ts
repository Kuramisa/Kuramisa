import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "debug",
    description: "Debug event"
})
export default class DjsDebugEvent extends AbstractKEvent {
    async run(debug: string) {
        this.logger.debug(`[Discord.js] ${debug}`);
    }
}
