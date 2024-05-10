import { AbstractDiscordEvent, DiscordEvent } from "@classes/DiscordEvent";

@DiscordEvent({
    name: "debug",
    description: "Debug event"
})
export default class DebugEvent extends AbstractDiscordEvent {
    async run(debug: string) {
        this.logger.debug(`[Discord.js] ${debug}`);
    }
}
