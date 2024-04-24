import { Command } from "@sapphire/framework";
import { ButtonStyle } from "discord-api-types/v10";

export class BotStaffCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "botstaff",
            description: "Shows the bot staff team"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { emojis, staff: staffs, util } = this.container;

        if (staffs.length === 0)
            return interaction.reply({
                content: "There are no staff members",
                ephemeral: true
            });

        const embeds = staffs.map((staff) =>
            util
                .embed()
                .setAuthor({
                    name: staff.globalName
                        ? `${staff.globalName} (${staff.username})`
                        : staff.username,
                    iconURL: staff.displayAvatarURL() ?? undefined
                })
                .setTitle(util.staffName(staff.type))
                .setDescription(`**${staff.description}**`)
                .setThumbnail(staff.displayAvatarURL())
        );

        let page = 0;

        const msg = await interaction.reply({ embeds: [embeds[page]] });

        if (embeds.length <= 1) return;

        const row = util.row().setComponents(
            util
                .button()
                .setCustomId("previous_page")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emojis.get("left_arrow") ?? "⬅️"),
            util
                .button()
                .setCustomId("next_page")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emojis.get("right_arrow") ?? "➡️")
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
