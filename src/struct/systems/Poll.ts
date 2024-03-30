import { container } from "@sapphire/framework";
import {
    TextInputStyle,
    type ChatInputCommandInteraction,
    ButtonStyle,
    ButtonInteraction,
    ModalBuilder,
    ComponentType,
    ActionRow,
    ButtonComponent
} from "discord.js";

import ms from "ms";

// TODO: Add emoji type poll support for polls (IMPORTANT)

export default class Poll {
    async createButtonBased(interaction: ChatInputCommandInteraction) {
        const { guild, options, user } = interaction;

        if (!guild)
            return interaction.reply(
                "This command can only be used in a server!"
            );

        const question = options.getString("question", true);
        const howMany = options.getInteger("how_many", true);
        const duration = options.getString("duration");
        const description = options.getString("poll_description");

        const { database, logger, util } = container;

        try {
            if (howMany <= 5) {
                const inputs = [];

                for (let i = 0; i < howMany; i++) {
                    inputs.push(
                        util.modalRow().setComponents(
                            util
                                .input()
                                .setCustomId(`answer_${i + 1}`)
                                .setLabel(`Answer ${i + 1}`)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );
                }

                const modal = util
                    .modal()
                    .setCustomId("poll_answers_less_than_5")
                    .setTitle("Poll Answers")
                    .setComponents(inputs);

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0
                });

                const answers = mInteraction.fields.fields.map(
                    (field) => field.value
                );

                // Duplicate Answers Check
                const dupeAnswers = answers.some(
                    (answer, index) => answers.indexOf(answer) !== index
                );

                if (dupeAnswers)
                    return mInteraction.reply({
                        content: "You cannot have duplicate answers!",
                        ephemeral: true
                    });

                const buttons = [];

                for (let i = 0; i < howMany; i++) {
                    buttons.push(
                        util
                            .button()
                            .setCustomId(`poll_answer_${i}`)
                            .setLabel(answers[i])
                            .setStyle(ButtonStyle.Primary)
                    );
                }

                const row = util.row().setComponents(buttons);

                const poll = util
                    .embed()
                    .setTitle(question)
                    .setFooter({
                        text: `Poll created by ${user.username}`,
                        iconURL: user.displayAvatarURL()
                    });

                if (description) poll.setDescription(description);

                const msg = await mInteraction.reply({
                    embeds: [poll],
                    components: [row],
                    fetchReply: true
                });

                const db = await database.guilds.fetch(guild.id);

                const btnOpts = buttons.map((btn, index) => ({
                    customId: msg.components[0].components[index].customId!,
                    text: btn.data.label!,
                    index,
                    votes: []
                }));

                db.polls.push({
                    messageId: msg.id,
                    channelId: msg.channelId,
                    buttons: btnOpts,
                    type: "buttons",
                    duration: duration ? ms(duration) : null
                });

                await db.save();

                return;
            }

            const modals = [];
            const inputs = [];

            for (let i = 0; i < howMany; i++) {
                inputs.push(
                    util.modalRow().setComponents(
                        util
                            .input()
                            .setCustomId(`answer_${i + 1}`)
                            .setLabel(`Answer ${i + 1}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );
            }

            const chunkInputs = util.chunk(inputs, 5);

            for (const chunk of chunkInputs) {
                const modal = util
                    .modal()
                    .setCustomId("poll_answers_more_than_5")
                    .setTitle("Poll Answers")
                    .setComponents(chunk);

                modals.push(modal);
            }

            const { interaction: bInteraction, answers } =
                await this.collectAnswers(interaction, modals);

            if (answers === null || answers.length !== howMany)
                return bInteraction.reply({
                    content: `**You must provide ${howMany} answers**`,
                    ephemeral: true
                });

            const duplicateAnswers = answers.some(
                (answer, index) => answers.indexOf(answer) !== index
            );

            if (duplicateAnswers)
                return bInteraction.reply({
                    content: "**You cannot have duplicate answers**",
                    ephemeral: true
                });

            const buttons = [];

            for (let i = 0; i < howMany; i++) {
                buttons.push(
                    util
                        .button()
                        .setCustomId(`poll_answer_${i}`)
                        .setLabel(`${answers[i]}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            const rows = [];

            const chunkedButtons = util.chunk(buttons, 5);

            for (const chunk of chunkedButtons) {
                const row = util.row().setComponents(chunk);
                rows.push(row);
            }

            const embed = util
                .embed()
                .setTitle(question)
                .setFooter({
                    text: `Poll by ${user.username}`,
                    iconURL: user.displayAvatarURL()
                });

            if (description) embed.setDescription(description);

            if (!(bInteraction instanceof ButtonInteraction)) return;

            await bInteraction.update({
                embeds: [],
                components: [],
                content: "Created the poll"
            });

            const message = await bInteraction.channel?.send({
                embeds: [embed],
                components: rows
            });

            if (!message) return;

            const db = await database.guilds.fetch(guild.id);

            const buttonsOpts = [];

            const messageComponents =
                message.components as ActionRow<ButtonComponent>[];

            let buttonIndex = 0;

            for (const row of messageComponents) {
                for (const button of row.components) {
                    buttonsOpts.push({
                        customId: button.customId as string,
                        text: button.label as string,
                        index: buttonIndex,
                        votes: []
                    });
                    buttonIndex++;
                }
            }

            db.polls.push({
                messageId: message.id,
                channelId: message.channelId,
                buttons: buttonsOpts,
                type: "buttons",
                duration: duration ? ms(duration) : null
            });

            await db.save();
        } catch (err) {
            logger.error(err);
            return interaction.reply({
                content: "**An error occurred while creating the poll!**",
                ephemeral: true
            });
        }
    }

    private async collectAnswers(
        interactionParam: ChatInputCommandInteraction | ButtonInteraction,
        modals: ModalBuilder[]
    ) {
        const { util } = container;

        let startInteraction = interactionParam;

        const answers: string[] = [];

        const processModal = async (
            interaction: ChatInputCommandInteraction | ButtonInteraction,
            modal: ModalBuilder
        ) => {
            await interaction.showModal(modal);

            const mInteraction = await interaction.awaitModalSubmit({
                time: 0
            });

            const ansrs = mInteraction.fields.fields.map(
                (field) => field.value
            );
            // Duplicate answers check
            const duplicateAnswers = ansrs.some(
                (answer, index) => ansrs.indexOf(answer) !== index
            );

            if (duplicateAnswers) {
                await mInteraction.reply({
                    content: "**You cannot have duplicate answers**",
                    ephemeral: true
                });
                return false;
            }

            const row = util
                .row()
                .setComponents(
                    util
                        .button()
                        .setCustomId("poll_progress_continue")
                        .setLabel("Continue")
                        .setStyle(ButtonStyle.Success),
                    util
                        .button()
                        .setCustomId("poll_progress_cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger)
                );

            const message = await mInteraction.reply({
                content: `**🔽 So far, you have provided following answers 🔽**\n\n${ansrs
                    .map((answer) => `**${answer}**`)
                    .join(",\n")}\n\n**Would you like to continue?**`,
                ephemeral: true,
                components: [row],
                fetchReply: true
            });

            const bInteraction = await message.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 0
            });

            if (bInteraction.customId === "poll_progress_cancel") {
                await bInteraction.update({
                    content: "**Poll creation cancelled**",
                    components: []
                });

                return false;
            }

            answers.push(...ansrs);

            startInteraction = bInteraction;

            return true;
        };

        for (const modal of modals) {
            const result = await processModal(startInteraction, modal);
            if (!result) break;
        }

        return { interaction: startInteraction, answers };
    }
}
