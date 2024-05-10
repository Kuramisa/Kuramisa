import { AbstractDiscordEvent, DiscordEvent } from "@classes/DiscordEvent";

@DiscordEvent({
    name: "ready",
    once: true,
    description: "Bot is ready!"
})
export default class ReadyEvent extends AbstractDiscordEvent {
    async run() {
        const { client, logger } = this;

        client.updateRest();

        client.initialized = true;
        logger.info(`[Bot] Ready! Logged in as ${client.user?.tag}`);
    }
}
