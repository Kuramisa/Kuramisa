import { CronJob } from "cron";
import logger from "Logger";
import ms from "ms";

import { AbstractEvent, Event } from "../../classes/Event";

@Event({
    event: "ready",
    description: "Emits when the bot is ready",
    once: true,
})
export default class ReadyEvent extends AbstractEvent {
    async run() {
        if (!this.container.client.isReady()) return;
        const { client } = this;

        await client.managers.commands.updateCommands();

        client.user.setPresence(client.getActivity());

        new CronJob("*/1 * * * *", () => {
            client.user.setPresence(client.getActivity());
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

        client.owners.set(ashUser.id, ashUser);
        client.owners.set(stealthUser.id, stealthUser);

        await client.application.commands.fetch();

        client.initialized = true;

        logger.info(`[Client] Started in ${ms(Date.now() - client.startTime)}`);
        logger.info(`[Client] Ready as ${client.user.tag}`);
    }
}
