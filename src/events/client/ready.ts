import logger from "Logger";
import { AbstractEvent, Event } from "../../classes/Event";
import { CronJob } from "cron";
import ms from "ms";

@Event({
    event: "ready",
    description: "Emits when the bot is ready",
    once: true,
})
export default class ReadyEvent extends AbstractEvent {
    async run() {
        if (!this.client.isReady()) return;
        const { client } = this;

        client.user.setPresence(client.getActivities());

        new CronJob("*/1 * * * *", () => {
            client.user.setPresence(client.getActivities());
        }).start();

        const emojis = await client.application.emojis.fetch();
        for (const emoji of emojis.values()) {
            if (!emoji.name) continue;
            client.kEmojis.set(emoji.name, emoji);
        }

        client.initialized = true;

        logger.info(`[Client] Started in ${ms(Date.now() - client.startTime)}`);
        logger.info(`[Client] Ready as ${client.user?.tag}`);
    }
}
