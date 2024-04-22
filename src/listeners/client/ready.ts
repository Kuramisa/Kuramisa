import { Listener } from "@sapphire/framework";
import { ActivityType, type TextChannel, type PresenceData } from "discord.js";
import { CronJob } from "cron";

export class ReadyListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            once: true,
            name: "clientReady",
            event: "ready"
        });
    }

    async run() {
        const { container } = this;
        const {
            client,
            dashboard,
            games: { valorant },
            systems: { music },
            logger,
            util
        } = container;

        try {
            logger.debug(music.scanDeps());
            logger.info("[Bot] Removing nonexistent commands...");
            const removedCommands = await util.removeNonexistentCommands();
            removedCommands.forEach((command) =>
                logger.info(
                    `Removed command ${command}, since it no longer exists`
                )
            );

            removedCommands.length === 0
                ? logger.info("[Bot] No commands need to be removed")
                : logger.info(
                      `[Bot] Removed ${removedCommands.length} commands`
                  );

            container.owners.push(
                await client.users.fetch("401269337924829186")
            );
            container.owners.push(
                await client.users.fetch("390399421780590603")
            );

            const mainServer = await client.guilds.fetch("1099437017076613134");
            const supportServer = await client.guilds.fetch(
                "1110011068488613931"
            );

            container.mainServer = mainServer;
            container.supportServer = supportServer;

            container.botLogs = (await supportServer.channels.fetch(
                "1110495993847361597"
            )) as TextChannel;

            container.devReports = (await supportServer.channels.fetch(
                "1110495968593448962"
            )) as TextChannel;
            container.devSuggestions = (await supportServer.channels.fetch(
                "1110495873638617192"
            )) as TextChannel;
            container.promoteChannel = (await supportServer.channels.fetch(
                "1117299595836395560"
            )) as TextChannel;

            const initialPresence = this.getActivities();

            client.user?.setPresence(initialPresence);

            const updatePresence = new CronJob("*/1 * * * *", async () => {
                client.user?.setPresence(this.getActivities());
            });

            /* const refreshValAccounts = new CronJob("*\/50 * * * *", () => {
                 valorant.refreshAccounts();
             });

             const notifyShops = new CronJob(
                 "0 17 * * * ",
                 async () => {
                     const db = await container.database.users.fetchAll();
                     for (const dbUser of db) {
                         let user = client.users.cache.get(dbUser.id);
                         if (!user) user = await client.users.fetch(dbUser.id);
                         const accounts = valorant.accounts.get(user.id);
                         if (accounts) {
                             const embeds = [];
                             for (const account of accounts.values()) {
                                 const skins =
                                     await valorant.shop.collectDailyShop(
                                         dbUser,
                                         account
                                     );
                                 if (skins) embeds.push(...skins);
                             }

                             if (dbUser.valorant.notifications.daily)
                                 await valorant.shop.notifyDailyShop(
                                     user,
                                     embeds
                                 );
                         }
                     }
                 },
                 null,
                 false,
                 "America/Los_Angeles"
             );*/

            updatePresence.start();
            // refreshValAccounts.start();
            // notifyShops.start();

            await this.clearEmptyDynamicChannels();

            await valorant.init();

            await this.initStaff();

            if (supportServer.available) {
                (await supportServer.emojis.fetch()).each((emoji) => {
                    if (emoji.name != null)
                        container.emojis.set(emoji.name, emoji);
                });
            }

            await dashboard.init();

            container.initialized = true;

            logger.info(`[Bot] Ready! Logged in as ${client.user?.tag}`);
        } catch (err) {
            logger.error(err);
        }
    }

    getActivities(): PresenceData {
        const { client } = this.container;

        const activities: PresenceData[] = [
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status",
                        state: "Pet fox",
                        type: ActivityType.Custom
                    }
                ]
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 2",
                        state: `Watching Over Approx. ${client.guilds.cache.size} servers`,
                        type: ActivityType.Custom
                    }
                ]
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 3",
                        state: `Watching Over Approx. ${client.users.cache.size} users`,
                        type: ActivityType.Custom
                    }
                ]
            }
        ];

        return activities[Math.floor(Math.random() * activities.length)];
    }

    private async initStaff() {
        const { client, database, logger, util } = this.container;

        logger.info("[Staff System] Initializing staff...");

        const staffDbs = await database.users.fetchStaff();
        const staffs: BotStaff[] = [];

        for (const staffDb of staffDbs) {
            let user = client.users.cache.get(staffDb.id);
            if (!user)
                user = await client.users
                    .fetch(staffDb.id)
                    .catch(() => undefined);
            if (!user) continue;
            staffs.push({
                ...user,
                ...staffDb._doc
            });

            logger.info(
                `[Staff System] Initialized ${
                    user.username
                } as ${util.staffName(staffDb.type)}`
            );
        }

        logger.info(
            `[Staff System] Initialized ${staffs.length} staff members`
        );

        this.container.staff = staffs;
    }

    private async clearEmptyDynamicChannels() {
        const { client, database, logger } = this.container;

        logger.info("[Bot] Clearing out empty dynamic voice channels...");

        const guilds = await database.guilds.fetchAll();

        for (const guild of guilds) {
            const { dvc } = guild;

            if (!dvc.length) return;

            const g = client.guilds.cache.get(guild.id);
            if (!g) return;

            const channels = g.channels.cache;

            const emptyChannels = dvc.filter(
                (channel) => !channels.has(channel.id)
            );

            if (!emptyChannels.length) return;

            guild.dvc = guild.dvc.filter(
                (channel) => !emptyChannels.find((ch) => ch.id === channel.id)
            );

            guild.markModified("dvc");
            await guild.save();
        }

        logger.info("Cleared out empty dynamic voice channels");
    }
}
