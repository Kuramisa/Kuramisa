import { KEmbed, KModal, KModalRow, KTextInput } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { mentionCommand } from "@utils";
import {
    ChatInputCommandInteraction,
    GuildMember,
    TextInputStyle
} from "discord.js";

const { version } = require("../../../package.json");

@SlashCommand({
    name: "announce",
    description: "Announce Bot changes to server owners",
    ownerOnly: true
})
export default class AnnounceCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { managers } = this.client;
        const { user } = interaction;

        const modal = new KModal()
            .setCustomId("announce_modal")
            .setTitle("Announcing bot changes to server owners")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("announcement")
                        .setLabel("Announcement")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0
        });

        await mInteraction.deferReply({ ephemeral: true });

        const text = mInteraction.fields.getTextInputValue("announcement");

        const owners: GuildMember[] = [];

        for (const guild of this.client.guilds.cache.values()) {
            const owner = await guild.fetchOwner().catch(() => null);
            if (!owner) continue;

            if (!owners.some((o) => o.id === owner.id)) owners.push(owner);
        }

        const embed = new KEmbed()
            .setAuthor({
                name: `${this.client.user?.username} Bot Announcement`,
                iconURL: user.displayAvatarURL()
            })
            .setTitle("Announcement from The Developers")
            .setDescription(
                `${text}\n\n*This is from the official developers and will not be used to spam the users*\n\n**Disclaimer: If you encounter any bugs or unresponsiveness, please DM me directly or use ${mentionCommand("report-bug")}**\n**If you have some suggestions please use ${mentionCommand("suggest")}**\n\n*To disable this notification, use ${mentionCommand("notifications")} command*\n\n- Sent by ${user}\n- **${this.client.user?.username} ${version}**`
            );

        for (const owner of owners) {
            const db = await managers.users.get(owner.id);
            if (!db.notifications.botAnnouncements) continue;

            this.logger.info(
                `Sending announcement to ${owner.user.globalName ?? owner.user.username}`
            );
            await owner.send({ embeds: [embed] });
        }

        await mInteraction.editReply({
            content: "Announcement sent to all server owners"
        });
    }
}
