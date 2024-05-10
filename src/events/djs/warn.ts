import { AbstractDiscordEvent, DiscordEvent } from "@classes/DiscordEvent";

@DiscordEvent({
    name: "warn",
    description: "Warn event"
})
export default class DJSErrorEvent extends AbstractDiscordEvent {
    async run(warn: string) {
        this.logger.warn(`[Discord.js] ${warn}`);
    }
}
