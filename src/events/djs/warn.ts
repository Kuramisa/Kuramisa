import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "warn",
    description: "Warn event"
})
export default class DjsWarnEvent extends AbstractKEvent {
    async run(warn: string) {
        this.logger.warn(`[Discord.js] ${warn}`);
    }
}
