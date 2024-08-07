import { KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { startCase } from "lodash";

@SlashCommand({
    name: "bot-notifications",
    description: "Toggle Bot notifications",
    options: [
        new KStringOption()
            .setName("bot-notification")
            .setDescription("The notification to toggle")

            .setChoices(
                {
                    name: "Announcements",
                    value: "announcements"
                },
                {
                    name: "Warns",
                    value: "warns"
                }
            )
    ]
})
export default class BotNotificationsCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const notification = options.getString("bot-notification", true);

        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        db.botNotifications[notification as keyof typeof db.botNotifications] =
            !db.botNotifications[
                notification as keyof typeof db.botNotifications
            ];

        await db.save();

        interaction.reply({
            content: `Bot Notifications for **${startCase(notification)}** have been **${
                db.botNotifications[
                    notification as keyof typeof db.botNotifications
                ]
                    ? "enabled"
                    : "disabled"
            }**`,
            ephemeral: true
        });
    }
}
