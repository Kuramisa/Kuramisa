import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "error",
    description: "Error event"
})
export default class DJSErrorEvent extends AbstractKEvent {
    async run(error: string) {
        this.logger.error(`[Discord.js] ${error}`);
    }
}
