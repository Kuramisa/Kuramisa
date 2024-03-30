import { Command } from "@sapphire/framework";
import { AttachmentBuilder, ButtonStyle, ComponentType } from "discord.js";
import { shuffle } from "lodash";

export class GuessTheColorCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "guessthecolor",
            description: "Guess the color game :>"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { logger } = this.container;

        let getColors = await this.getColors();

        const message = await interaction.reply({
            components: [getColors.row],
            files: [getColors.attachment],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                (i.customId === "wrong-answer-1" ||
                    i.customId === "wrong-answer-2" ||
                    i.customId === "correct-answer") &&
                i.user.id === interaction.user.id,
            time: 30000
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case "correct-answer": {
                        getColors = await this.getColors();

                        await i.update({
                            content: "",
                            components: [getColors.row],
                            files: [getColors.attachment]
                        });
                        break;
                    }
                    case "wrong-answer-1":
                    case "wrong-answer-2":
                        await i.update({ content: "**⛔ Incorrect**" });
                        break;
                }
            })
            .on("end", (_, reason) => {
                if (reason !== "messageDelete")
                    message.delete().catch(logger.error);
            });
    }

    private async getColors() {
        const { kanvas, util } = this.container;

        const correctColor = this.randomColor();
        const colorImage = kanvas.makeBackground(correctColor);

        const buttons = [
            util
                .button()
                .setCustomId("wrong-answer-1")
                .setLabel(this.randomColor())
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("wrong-answer-2")
                .setLabel(this.randomColor())
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("correct-answer")
                .setLabel(correctColor)
                .setStyle(ButtonStyle.Secondary)
        ];

        const row = util.row().setComponents(shuffle(buttons));

        const attachment = new AttachmentBuilder(colorImage);

        return { row, attachment };
    }

    private randomColor() {
        const hex = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
        ];

        const color = new Array(6)
            .fill("")
            .map(() => hex[Math.floor(Math.random() * hex.length)])
            .join("");

        return `#${color}`;
    }
}
