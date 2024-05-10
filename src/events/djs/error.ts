import { AbstractDiscordEvent, DiscordEvent } from "@classes/DiscordEvent";

@DiscordEvent({
    name: "error",
    description: "Error event"
})
export default class DJSErrorEvent extends AbstractDiscordEvent {
    async run(error: string) {
        this.logger.error(`[Discord.js] ${error}`);
    }
}
