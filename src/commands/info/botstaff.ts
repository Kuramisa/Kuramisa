import { Command } from "@sapphire/framework";
import { ButtonStyle } from "discord-api-types/v10";

export class BotStaffCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "botstaff",
            description: "Shows the bot staff team",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { staff: staffs, util } = this.container;

        if (staffs.length === 0)
            return interaction.reply({
                content: "There are no staff members",
                ephemeral: true,
            });

        const embeds = staffs.map((staff) =>
            util
                .embed()
                .setAuthor({
                    name: staff.user.globalName
                        ? `${staff.user.globalName} (${staff.user.username})`
                        : staff.user.username,
                    iconURL: staff.user.displayAvatarURL() ?? undefined,
                })
                .setTitle(util.staffName(staff.type))
                .setDescription(`**${staff.description}**`)
                .setThumbnail(staff.user.displayAvatarURL())
        );

        let page = 0;

        const msg = await interaction.reply({ embeds: [embeds[page]] });

        if (embeds.length <= 1) return;

        const row = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("previous")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Previous")
                    .setEmoji("⬅️"),
                util
                    .button()
                    .setCustomId("next")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Next")
                    .setEmoji("➡️")
            );

        await msg.edit({ components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "previous": {
                    page--;

                    if (page < 0) page = embeds.length - 1;

                    await i.update({ embeds: [embeds[page]] });
                    break;
                }

                case "next": {
                    page++;

                    if (page > embeds.length - 1) page = 0;

                    await i.update({ embeds: [embeds[page]] });
                    break;
                }
            }
        });
    }
}
