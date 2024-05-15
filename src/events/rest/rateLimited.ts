import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { RateLimitError } from "discord.js";
import ms from "ms";

@KEvent({
    event: "rateLimited",
    description: "Emits when the bot is rate limited",
    emitter: kuramisa.rest
})
export default class RestRateLimitedEvent extends AbstractKEvent {
    async run(error: RateLimitError) {
        this.logger.error(
            `[REST Rate Limit]: ${error.route} | ${error.method} ${error.url}`
        );
        this.logger.error(
            `[REST Rate Limit]: Try again in ${ms(error.retryAfter, { long: true })}`
        );
    }
}
