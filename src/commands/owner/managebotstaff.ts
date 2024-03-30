import { Command } from "@sapphire/framework";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";

import DbStaff from "../../schemas/Staff";

export class BotStaffCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "botstaffmanage",
            description: "Bot Staff Management",
            preconditions: ["StaffOnly"]
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDefaultMemberPermissions(null)
                .addSubcommand((command) =>
                    command
                        .setName("add")
                        .setDescription("Add a user to bot staff")
                        .addUserOption((option) =>
                            option
                                .setName("user")
                                .setDescription("The user to add")
                                .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("staff_type")
                                .setDescription("The staff type")
                                .setRequired(true)
                                .setChoices(
                                    {
                                        name: "Lead Developer",
                                        value: "lead_developer"
                                    },
                                    {
                                        name: "Developer",
                                        value: "developer"
                                    },
                                    {
                                        name: "Designer",
                                        value: "designer"
                                    },
                                    {
                                        name: "Bug Tester",
                                        value: "bug_tester"
                                    },
                                    {
                                        name: "Translator",
                                        value: "translator"
                                    }
                                )
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { options, user: executor } = interaction;

        const { database, owners, util } = this.container;

        switch (options.getSubcommand()) {
            case "add": {
                if (!owners.find((owner) => owner.id === executor.id))
                    return interaction.reply({
                        content: "Only the bot owner can use this command",
                        ephemeral: true
                    });

                const user = options.getUser("user", true);
                const staff = await database.users.fetchStaff();

                if (staff.find((s) => s.id === user.id))
                    return interaction.reply({
                        content: `${user} is already staff`,
                        ephemeral: true
                    });

                const dm = await user.createDM().catch(() => null);
                if (!dm)
                    return interaction.reply({
                        content: "User has DMs disabled",
                        ephemeral: true
                    });

                const staffType = options.getString(
                    "staff_type",
                    true
                ) as StaffType;
                const staffTypeName =
                    staffType === "lead_developer"
                        ? "Lead Developer"
                        : staffType === "developer"
                          ? "Developer"
                          : "Helper";

                const acceptRow = util
                    .row()
                    .addComponents(
                        util
                            .button()
                            .setCustomId("accept")
                            .setLabel("Accept the invitation")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Success),
                        util
                            .button()
                            .setCustomId("deny")
                            .setLabel("Deny the invitation")
                            .setEmoji("✖️")
                            .setStyle(ButtonStyle.Danger)
                    );

                await interaction.reply({
                    content: `${user} has been invited to bot staff as **${staffTypeName}**`,
                    ephemeral: true
                });

                const message = await dm.send({
                    content: `✉️ You have been invited to join the bot staff as a **${staffTypeName}**`,
                    components: [acceptRow]
                });

                const bInteraction = await message.awaitMessageComponent({
                    filter: (i) => user.id === i.user.id,
                    time: 60000
                });

                if (bInteraction.customId === "accept") {
                    await DbStaff.create({
                        id: user.id,
                        username: user.username,
                        type: staffType
                    });

                    await bInteraction.update({
                        content: `🥳 **You have joined the bot staff as a ${staffTypeName}**`,
                        components: []
                    });

                    await interaction
                        .editReply({
                            content: `${user} has joined the bot staff`
                        })
                        .catch(() => {
                            this.container.botLogs?.send({
                                content: `${user} has joined the bot staff`
                            });
                        });

                    const choiceRow = util
                        .row()
                        .addComponents(
                            util
                                .button()
                                .setCustomId("yes")
                                .setLabel("Yes")
                                .setEmoji("✅")
                                .setStyle(ButtonStyle.Success),
                            util
                                .button()
                                .setCustomId("no")
                                .setLabel("No")
                                .setEmoji("✖️")
                                .setStyle(ButtonStyle.Danger)
                        );

                    const msg = await dm.send({
                        content:
                            "**📝 Do you want to add a description to your bot staff profile?**",
                        components: [choiceRow]
                    });

                    const bInteraction2 = await msg.awaitMessageComponent({
                        filter: (i) => user.id === i.user.id,
                        time: 60000
                    });

                    if (bInteraction2.customId === "yes") {
                        const modal = util
                            .modal()
                            .setCustomId("bot_staff_description_modal")
                            .setTitle("Bot Staff Profile Description")
                            .setComponents(
                                util
                                    .modalRow()
                                    .setComponents(
                                        util
                                            .input()
                                            .setCustomId(
                                                "bot_staff_description"
                                            )
                                            .setLabel("Description")
                                            .setPlaceholder(
                                                "Enter a description"
                                            )
                                            .setStyle(TextInputStyle.Paragraph)
                                    )
                            );

                        await bInteraction2.showModal(modal);

                        const mInteraction =
                            await bInteraction2.awaitModalSubmit({
                                filter: (i) => user.id === i.user.id,
                                time: 60000
                            });

                        const dbStaff = await DbStaff.findOne({ id: user.id });

                        if (!dbStaff) return;

                        dbStaff.description =
                            mInteraction.fields.getTextInputValue(
                                "bot_staff_description"
                            );

                        await dbStaff.save();

                        await mInteraction.reply({
                            content:
                                "**📝 Your bot staff profile description has been saved**",
                            ephemeral: true
                        });
                    } else {
                        await bInteraction2.update({
                            content:
                                "**😔 You have denied the bot staff profile description**",
                            components: []
                        });
                    }
                } else {
                    await bInteraction.update({
                        content: "You have denied the bot staff invitation",
                        components: []
                    });
                    await interaction.editReply({
                        content: `${user} has denied the bot staff invitation`
                    });
                }
            }
        }
    }
}
