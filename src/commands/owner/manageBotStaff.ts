import {
    KButton,
    KModal,
    KModalRow,
    KRow,
    KStringOption,
    KTextInput,
    KUserOption
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    TextInputStyle
} from "discord.js";
import { startCase } from "lodash";
import DBStaff from "@schemas/Staff";

@SlashCommand({
    name: "manage-bot-staff",
    description: "Manage bot staff",
    staffOnly: true,
    subcommands: [
        {
            name: "add",
            description: "Add a bot staff member",
            options: [
                new KUserOption()
                    .setName("user")
                    .setDescription("The user to add"),
                new KStringOption()
                    .setName("staff_type")
                    .setDescription("The staff type")

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
            ]
        }
    ]
})
export default class SCommand extends AbstractSlashCommand {
    async slashAdd(interaction: ChatInputCommandInteraction) {
        const { options, user: executor } = interaction;

        const { database, kEmojis: emojis, owners } = this.client;

        if (!owners.find((owner) => owner.id === executor.id))
            return interaction.reply({
                content: "You are not allowed to use this command",
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
                content: "I couldn't send a DM to the user",
                ephemeral: true
            });

        const staffType = options.getString("staff_type", true) as StaffType;
        const staffTypeName = startCase(staffType);

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("accept_staff")
                .setLabel("Accept")
                .setEmoji(emojis.get("yes")?.toString() ?? "✅")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("deny_staff")
                .setLabel("Deny")
                .setEmoji(emojis.get("no")?.toString() ?? "❌")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `${user} has been invited to join the staff team as a ${staffTypeName}`,
            ephemeral: true
        });

        const message = await dm.send({
            content: `✉️ You have been invited to join the bot staff as a **${staffTypeName}**`,
            components: [row]
        });

        const bInteraction = await message.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === user.id,
            time: 0
        });

        if (bInteraction.customId !== "accept_staff") {
            await bInteraction.update({
                content: "You have denied the invitation",
                components: []
            });
            await interaction.editReply({
                content: `${user} has denied the invitation`
            });
            return;
        }

        await DBStaff.create({
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
                content: `${user} has joined the staff team as a ${staffTypeName}`
            })
            .catch(() => {
                this.client.botLogs?.send({
                    content: `${user} has joined the staff team as a ${staffTypeName}`
                });
            });

        const choiceRow = new KRow().setComponents(
            new KButton()
                .setCustomId("add_bio")
                .setLabel("Add Bio")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("dont_add_bio")
                .setLabel("No")
                .setStyle(ButtonStyle.Secondary)
        );

        const bioMessage = await dm.send({
            content:
                "Would you like to bio to your bot staff profile? **(This can be done later and is optional)**",
            components: [choiceRow]
        });

        const bInteraction2 = await bioMessage.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === user.id,
            time: 0
        });

        if (bInteraction2.customId !== "add_bio") {
            await bInteraction2.update({
                content:
                    "**😔 You have denied the bot staff profile description**",
                components: []
            });
            return;
        }

        const modal = new KModal()
            .setCustomId("add_bio_modal")
            .setTitle("Add Bio")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("bot_staff_bio")
                        .setLabel("Bio")
                        .setPlaceholder("Enter your bio")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await bInteraction2.showModal(modal);

        const mInteraction = await bInteraction2.awaitModalSubmit({
            filter: (i) => i.user.id === user.id,
            time: 0
        });

        const dbStaff = await DBStaff.findOne({
            id: user.id
        });

        if (!dbStaff) return;

        dbStaff.description =
            mInteraction.fields.getTextInputValue("bot_staff_bio");

        await dbStaff.save();

        await mInteraction.reply({
            content: "Your bio has been added to your bot staff profile",
            components: []
        });
    }
}
