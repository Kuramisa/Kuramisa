import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "debug",
    description: "Debug event"
})
export default class DebugEvent extends AbstractKEvent {
    async run(debug: string) {
        this.logger.debug(`[Discord.js] ${debug}`);
    }
}
