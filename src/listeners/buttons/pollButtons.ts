import { Listener } from "@sapphire/framework";
import {
    ActionRowBuilder,
    type APIButtonComponent,
    ButtonComponent,
    ButtonInteraction,
    createComponentBuilder,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import moment from "moment";

export class PollButtonsListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Poll Buttons Listener",
            event: "interactionCreate",
        });
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("poll_answer_")) return;

        const { customId, guild, message, user } = interaction;

        if (!guild) return;

        const { database } = this.container;

        const db = await database.guilds.fetch(guild.id);

        const { polls } = db;

        if (!polls || polls.length === 0) return;

        const poll = polls.find((poll) => poll.messageId === message.id);

        if (!poll) {
            return interaction.reply({
                content: "No poll found",
                ephemeral: true,
            });
        }

        const answerIndex = customId.split("_")[2];

        const { buttons } = poll;

        if (!buttons)
            return interaction.reply({
                content: "No buttons on this poll",
                ephemeral: true,
            });

        let alreadyVoted = {
            customId: "",
            buttonLabel: "",
            value: false,
        };

        for (const button of buttons) {
            if (button.votes?.find((vote) => vote.userId === user.id)) {
                alreadyVoted = {
                    customId: button.customId,
                    buttonLabel: button.text,
                    value: true,
                };
                break;
            }
        }

        if (alreadyVoted.value && alreadyVoted.customId !== customId)
            return interaction.reply({
                content: `You have already voted on **${alreadyVoted.buttonLabel}**`,
                ephemeral: true,
            });

        const answer = buttons.find(
            (btn) => btn.index === parseInt(answerIndex)
        );

        if (!answer)
            return interaction.reply({
                content: "No answer found",
                ephemeral: true,
            });

        const vote = answer.votes.find((vote) => vote.userId === user.id);

        const btnComponent = message.components
            .find((row) =>
                row.components.find((btn) => btn.customId === customId)
            )
            ?.components.find((btn) => btn.customId === customId);

        if (!btnComponent)
            return interaction.reply({
                content: "No button component found",
                ephemeral: true,
            });

        if (!(btnComponent instanceof ButtonComponent))
            return interaction.reply({
                content: "Button component is not a button",
                ephemeral: true,
            });

        if (vote) {
            answer.votes = answer.votes.filter(
                (vote) => vote.userId !== user.id
            );

            await interaction.reply({
                content: `You have removed your vote from **${answer.text}**`,
                ephemeral: true,
            });
        } else {
            answer.votes.push({
                userId: user.id,
                votedAt: moment().unix(),
            });

            await interaction.reply({
                content: `You have voted for **${answer.text}**`,
                ephemeral: true,
            });
        }

        const newBtn = createComponentBuilder(btnComponent.data);

        if (answer.votes.length > 0)
            newBtn.setLabel(
                `${answer.text} (Vote${answer.votes.length > 1 ? "s" : ""} - ${
                    answer.votes.length
                })`
            );
        else if (answer.votes.length === 0) newBtn.setLabel(answer.text);

        const rows = message.components.map((_row) => {
            return _row.components.map((_btn) => {
                if (_btn.customId === customId) return newBtn.toJSON();
                return _btn.toJSON();
            });
        }) as APIButtonComponent[][];

        const newRows = rows.map((row) =>
            new ActionRowBuilder().addComponents(
                row.map((btn) => createComponentBuilder(btn))
            )
        );

        await message.edit({
            components:
                newRows as ActionRowBuilder<MessageActionRowComponentBuilder>[],
        });

        db.markModified("polls");
        db.markModified("polls.buttons");
        db.markModified("polls.buttons.votes");
        db.markModified("polls.buttons.votes.userId");
        db.markModified("polls.buttons.votes.votedAt");

        await db.save();
    }
}
