import { KButton, KEmbed, KRow } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { staffName } from "@utils";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "bot-staff",
    description: "Shows the bot staff list"
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { kEmojis, staff: staffs } = this.client;

        if (staffs.length === 0)
            return interaction.reply({
                content: "**There are no staff members**",
                ephemeral: true
            });

        const embeds = staffs.map((staff) =>
            new KEmbed()
                .setAuthor({
                    name: staff.globalName
                        ? `${staff.globalName} (${staff.username})`
                        : staff.username,
                    iconURL: staff.displayAvatarURL() ?? undefined
                })
                .setTitle(staffName(staff.type))
                .setDescription(staff.description ?? null)
                .setThumbnail(staff.displayAvatarURL())
        );

        let page = 0;

        const msg = await interaction.reply({ embeds: [embeds[page]] });

        if (embeds.length <= 1) return;

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow")?.toString() ?? "⬅️"),
            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow")?.toString() ?? "➡️")
        );

        await msg.edit({ components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "previous_page": {
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                }

                case "next_page": {
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                }
            }

            await i.update({
                embeds: [embeds[page]]
            });
        });
    }
}
