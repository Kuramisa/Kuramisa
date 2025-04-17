import { container } from "@sapphire/pieces";
import { AbstractEvent, Event } from "classes/Event";
import type { RateLimitError } from "discord.js";
import ms from "ms";
@Event({
    event: "rateLimited",
    description: "Emits when the bot is rate limited",
    emitter: container.client.rest,
})
export default class RateLimitEvent extends AbstractEvent {
    run(error: RateLimitError) {
        const { logger } = this.container;

        logger.error(
            `[REST Rate Limit] ${error.route} | ${error.method} ${error.url}`,
        );
        logger.error(
            `[REST Rate Limit] Try again in ${ms(error.retryAfter, { long: true })}`,
        );
    }
}
