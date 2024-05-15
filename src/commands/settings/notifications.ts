import { KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { startCase } from "lodash";

@SlashCommand({
    name: "notifications",
    description: "Toggle notifications for the server",
    options: [
        new KStringOption()
            .setName("notification")
            .setDescription("The notification to toggle")
            .setRequired(true)
            .setChoices(
                {
                    name: "Bot Announcements",
                    value: "botAnnouncements"
                },
                {
                    name: "Warns",
                    value: "warns"
                }
            )
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const notification = options.getString("notification", true);

        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        const { notifications } = db;

        db.notifications[notification as keyof typeof notifications] =
            !db.notifications[notification as keyof typeof notifications];

        await db.save();

        interaction.reply({
            content: `Notifications for **${startCase(notification)}** have been **${
                db.notifications[notification as keyof typeof notifications]
                    ? "enabled"
                    : "disabled"
            }**`,
            ephemeral: true
        });
    }
}
