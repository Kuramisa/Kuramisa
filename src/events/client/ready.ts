import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { CronJob } from "cron";
import { TextChannel } from "discord.js";
import ms from "ms";

const { ASH, STEALTH } = process.env;

@KEvent({
    event: "ready",
    once: true,
    description: "Emits when the bot is ready"
})
export default class ReadyEvent extends AbstractKEvent {
    async run() {
        const { client, logger } = this;
        const {
            dashboard,
            kanvas,
            games: { valorant },
            systems: { music },
            owners
        } = client;

        try {
            await client.updateRest();
            await kanvas.loadFonts();
            await client.initStaff();

            logger.debug(music.scanDeps());

            owners.push(await client.users.fetch(ASH ?? "390399421780590603"));
            owners.push(
                await client.users.fetch(STEALTH ?? "401269337924829186")
            );

            const mainServer = await client.guilds.fetch("1110011068488613931");
            client.mainServer = mainServer;

            client.botLogs = (await mainServer.channels.fetch(
                "1110495993847361597"
            )) as TextChannel;

            client.bugReports = (await mainServer.channels.fetch(
                "1110495968593448962"
            )) as TextChannel;
            client.suggestions = (await mainServer.channels.fetch(
                "1110495873638617192"
            )) as TextChannel;
            client.promoteChannel = (await mainServer.channels.fetch(
                "1117299595836395560"
            )) as TextChannel;

            client.user?.setPresence(client.getActivities());

            const updatePresence = new CronJob("*/1 * * * *", async () => {
                client.user?.setPresence(client.getActivities());
            });

            updatePresence.start();

            await client.clearEmptyDynamicChannels();
            await valorant.init();

            if (mainServer.available) {
                (await mainServer.emojis.fetch()).each((emoji) => {
                    if (emoji.name) client.kEmojis.set(emoji.name, emoji);
                });
            }

            await dashboard.init();
            await client.application?.commands.fetch();
            client.initialized = true;
            logger.info(
                `[Bot] Started in ${ms(Date.now() - client.startTime)}`
            );
            logger.info(`[Bot] Ready! Logged in as ${client.user?.tag}`);
        } catch (err) {
            logger.error(err);
        }
    }
}
