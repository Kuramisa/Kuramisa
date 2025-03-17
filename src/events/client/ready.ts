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

        client.managers.commands.updateCommands();

        client.user.setPresence(client.getActivities());

        new CronJob("*/1 * * * *", () => {
            client.user.setPresence(client.getActivities());
        }).start();

        const emojis = await client.application.emojis.fetch();
        for (const emoji of emojis.values()) {
            if (!emoji.name) continue;
            client.kEmojis.set(emoji.name, emoji);
        }

        const ashUser =
            client.users.cache.get("390399421780590603") ??
            (await client.users.fetch("390399421780590603"));
        const stealthUser =
            client.users.cache.get("401269337924829186") ??
            (await client.users.fetch("401269337924829186"));
        client.owners.push(ashUser, stealthUser);

        client.initialized = true;

        logger.info(`[Client] Started in ${ms(Date.now() - client.startTime)}`);
        logger.info(`[Client] Ready as ${client.user?.tag}`);
    }
}
